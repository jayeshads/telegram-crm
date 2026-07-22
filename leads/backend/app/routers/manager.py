import json

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.db import conversation_store
from app.manager import ai_manager
from app.manager.ai_manager import ManagerResponse
from app.auth import get_current_user, CurrentUser
from app.rate_limit import check_rate_limit

router = APIRouter(prefix="/api/manager", tags=["ai-manager"])


class ChatRequest(BaseModel):
    business_id: str
    message: str = Field(..., min_length=1)
    debug: bool = False  # include the tool-call trace in the response
    session_id: str | None = None  # which chat this message belongs to; omit to use/continue the most recent one


class NewSessionRequest(BaseModel):
    business_id: str
    campaign_id: str | None = None  # set when opened via "Open chat" from a specific campaign


def _require_own_business(payload_business_id: str, user: CurrentUser):
    if user.role != "admin" and payload_business_id != user.id:
        raise HTTPException(403, "You may only access your own business account's AI Manager data.")


def _sse_frame(event: dict) -> str:
    return f"data: {json.dumps(event)}\n\n"


def _message_event(result: ManagerResponse) -> dict:
    """Maps a final ManagerResponse onto the `message` SSEEvent shape."""
    event = {
        "type": "message",
        "content": result.message,
        "awaiting_user": result.awaiting_user,
    }
    if result.options:
        event["options"] = result.options
    if result.trace:
        event["trace"] = result.trace
    return event


def _stream_chat(payload: "ChatRequest"):
    """Generator that drives ai_manager.run_turn_stream and frames each step
    as an SSE event: tool_start / tool_end while the Manager is working,
    one message event with the final answer, an error event if something
    goes wrong, and always a closing done event."""
    try:
        for event in ai_manager.run_turn_stream(
            payload.business_id, payload.message,
            include_trace=payload.debug, session_id=payload.session_id,
        ):
            if isinstance(event, ManagerResponse):
                yield _sse_frame(_message_event(event))
            else:
                yield _sse_frame(event)
    except ValueError as e:
        yield _sse_frame({"type": "error", "error": str(e)})
    yield _sse_frame({"type": "done"})


@router.post("/chat")
def chat(payload: ChatRequest, stream: bool = Query(True),
         user: CurrentUser = Depends(get_current_user)):
    """
    Single entrypoint for the LeadPilot AI Manager (the Brain) — and the
    ONLY AI Manager endpoint the dashboard frontend calls to actually talk
    to the AI. The Manager decides internally which tool(s) - Business
    Analysis, Strategy, Creative, Landing Page, Meta Ads, Analytics,
    Knowledge, Memory, Compliance, Support - to use for this message, runs
    them, and returns one final response. All existing phase-specific
    endpoints (/strategy, /creative, /meta, /monitoring, ...) still work for
    internal/admin use, but the frontend never calls them directly - every
    dashboard AI action goes through this one endpoint, and only the
    Manager decides which tool runs.

    business_id must equal the caller's own Supabase user id, unless the
    caller is an admin - this is what stops one client from ever running
    the Manager against another client's business data.

    session_id scopes this message to one particular chat ("New chat" in the
    frontend = a session created via POST /manager/sessions first). If
    omitted, the Manager falls back to the business's most recently active
    session (or creates one) so older callers keep working.

    By default this now streams per-step Server-Sent Events (tool_start,
    tool_end, message, error, done — see docs/PHASE1_SSE.md for the schema)
    instead of waiting for the whole turn to finish. Pass `?stream=false`
    to get the old single final-JSON-blob behavior back (Phase 1, task 1.5).
    """
    _require_own_business(payload.business_id, user)
    check_rate_limit(f"manager_chat:{user.id}")

    if not stream:
        try:
            result = ai_manager.run_turn(
                payload.business_id, payload.message,
                include_trace=payload.debug, session_id=payload.session_id,
            )
        except ValueError as e:
            raise HTTPException(422, str(e))
        return result.to_dict()

    return StreamingResponse(_stream_chat(payload), media_type="text/event-stream")


@router.get("/sessions")
def list_sessions(business_id: str = Query(...), user: CurrentUser = Depends(get_current_user)):
    """All of this business's chats, most recently active first — this is
    the entire data source for the "previous chats" sidebar."""
    _require_own_business(business_id, user)
    return conversation_store.list_sessions(business_id)


@router.post("/sessions")
def create_session(payload: NewSessionRequest, user: CurrentUser = Depends(get_current_user)):
    """Creates a real, separate, server-side chat. This is what the "New
    chat" button should call — previously there was no such concept at all,
    so "New chat" could only ever wipe the one conversation a business had."""
    _require_own_business(payload.business_id, user)
    return conversation_store.create_session(payload.business_id, campaign_id=payload.campaign_id)


@router.get("/sessions/{session_id}/history")
def session_history(session_id: str, business_id: str = Query(...), user: CurrentUser = Depends(get_current_user)):
    """Full turn history for one chat session — what the frontend loads
    when it opens or resumes a session."""
    _require_own_business(business_id, user)
    session = conversation_store.get_session(session_id, business_id)
    if session is None:
        raise HTTPException(404, "Chat session not found.")
    return {"session": session, "turns": conversation_store.get_history(session_id, limit=200)}


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, business_id: str = Query(...), user: CurrentUser = Depends(get_current_user)):
    _require_own_business(business_id, user)
    conversation_store.delete_session(session_id, business_id)
    return {"deleted": True}
