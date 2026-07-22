import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  Mic,
  ArrowUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Camera,
  Video,
  X,
  ChevronRight,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  agentName?: string;
  text: string;
  timestamp: string;
  options?: string[];
}

export const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      agentName: 'Head Agent (Neo)',
      text: "Namaste! Main aapka AI Meta Ads Orchestrator (Neo) hoon.\n\nAap natural language mein apne business ya product ke baare mein batao, main automatic:\n- Campaign structure & objective\n- High-converting audience targeting\n- Creative headlines & primary copy\n- Landing page auto-fill ready karke dunga.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      options: ['Start New Campaign', 'Optimize Existing Ads', 'Create Ad Creatives'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentWaiting, setAgentWaiting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentTrail, setAgentTrail] = useState<string[]>(['Head Agent']);

  const [previewTab, setPreviewTab] = useState<'campaign' | 'ad' | 'landing'>('campaign');
  const [campaignPreview, setCampaignPreview] = useState<any>({
    name: 'Handmade Candles — Lead Gen Q3',
    objective: 'OUTCOME_LEADS',
    budget: '₹500 / day',
    placements: ['FB Feed', 'IG Feed', 'IG Stories'],
  });
  const [adPreview, setAdPreview] = useState<any>({
    headline: 'Get 20% OFF Organic Soy Candles',
    primary_text: 'Transform your home ambiance with 100% organic soy wax scented candles. Special discount today!',
    cta: 'Shop Now',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getCurrentTimestamp = () => {
    return new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: getCurrentTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    setAgentWaiting(false);
    setErrorMessage(null);

    try {
      const res = await fetchWithAuth('/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === 'agent_start') {
                setAgentTrail((prev) => (prev.includes(data.agent) ? prev : [...prev, data.agent]));
              } else if (data.type === 'preview_update') {
                if (data.payload) {
                  setCampaignPreview((prev: any) => ({ ...prev, ...data.payload }));
                }
              } else if (data.type === 'message') {
                const aiMsg: ChatMessage = {
                  id: Date.now().toString(),
                  sender: 'ai',
                  agentName: data.agent || 'Business Analyzer',
                  text: data.text,
                  timestamp: getCurrentTimestamp(),
                  options: data.options || [],
                };
                setMessages((prev) => [...prev, aiMsg]);
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (err) {
      // Fallback message
      const fallbackMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        agentName: 'Business Analyzer',
        text: `Maine aapka intent ("${messageText}") process kar liya hai. Choose daily campaign budget:`,
        timestamp: getCurrentTimestamp(),
        options: ['₹500 / day', '₹1,000 / day', '₹2,500 / day'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setAgentTrail((prev) => (prev.includes('Business Analyzer') ? prev : [...prev, 'Business Analyzer']));
    } finally {
      setLoading(false);
      setAgentWaiting(true);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 overflow-hidden bg-[#0d0d0d] font-sans text-zinc-100 relative -m-6 p-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0d0d0d] relative rounded-2xl border border-zinc-800/60 overflow-hidden">
        {/* Top Header & Agent Trail Bar */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Emergent Meta AI Orchestrator</h2>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>Agent Trail:</span>
                {agentTrail.map((a, i) => (
                  <span key={i} className="text-teal-300 font-medium">{a}{i < agentTrail.length - 1 ? ' → ' : ''}</span>
                ))}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">GPT-5.2 + Sonnet 4.5</span>
        </div>

        {/* 1. Messages Stream Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-6 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              {msg.sender === 'user' ? (
                /* USER MESSAGE CARD (Teal Bubble Style) */
                <div className="group relative max-w-3xl ml-auto">
                  <div className="bg-[#092b27] border border-[#0f403a] rounded-2xl p-4 md:p-5 shadow-lg text-zinc-100 space-y-2">
                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.text}</p>
                    <div className="text-[11px] text-zinc-400 mt-3 text-right flex justify-end items-center gap-2">
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                  {/* Hover Action Toolbar */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end gap-2 mt-1.5 pr-1 text-zinc-500">
                    <button onClick={() => handleCopyText(msg.text)} title="Copy" className="p-1 hover:text-zinc-200 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleSend(msg.text)} title="Retry" className="p-1 hover:text-zinc-200 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* AI MESSAGE CARD */
                <div className="w-full max-w-3xl mr-auto py-2 text-zinc-200 space-y-3">
                  {msg.agentName && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>{msg.agentName}</span>
                    </div>
                  )}

                  <div className="space-y-3 leading-relaxed text-sm">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        const items = paragraph.split('\n');
                        return (
                          <ul key={pIdx} className="list-disc pl-5 space-y-1 text-zinc-300">
                            {items.map((it, idx) => (
                              <li key={idx}>{it.replace(/^[-*]\s+/, '')}</li>
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={pIdx} className="whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* Discrete options if present */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(opt)}
                          className="text-xs px-3.5 py-1.5 rounded-full bg-[#18181b] hover:bg-[#27272a] text-teal-300 border border-teal-500/30 transition-all font-medium cursor-pointer"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hover Actions for AI */}
                  <div className="flex items-center gap-3 pt-1 text-zinc-500 text-xs">
                    <button className="p-1 hover:text-zinc-200 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 hover:text-zinc-200 transition-colors">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleCopyText(msg.text)} className="p-1 hover:text-zinc-200 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Neo is thinking and orchestrating agents…</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Status Badge ("Agent is waiting...") */}
        {agentWaiting && !loading && (
          <div className="max-w-3xl w-full mx-auto px-4 flex justify-start">
            <div className="inline-flex items-center gap-2 text-xs text-zinc-400 bg-[#171717] px-3 py-1.5 rounded-full border border-zinc-800/80 mb-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Agent is waiting for your reply...</span>
            </div>
          </div>
        )}

        {/* 2. FLOATING BOTTOM INPUT DOCK ("Message Neo") */}
        <div className="max-w-3xl w-full mx-auto px-4 pb-4">
          <div className="bg-[#18181b] border border-zinc-700/60 rounded-2xl p-3 shadow-2xl space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Neo"
              rows={2}
              className="bg-transparent border-none focus:outline-none text-white placeholder-zinc-500 text-sm w-full resize-none min-h-[40px]"
            />

            {/* Action Chips & Controls Row */}
            <div className="flex items-center justify-between pt-1">
              {/* Left Section (Chips) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  title="Upload File"
                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('Generate creative ad image for my product')}
                  className="bg-[#27272a] hover:bg-[#3f3f46] text-xs text-zinc-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-zinc-700/50 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-400" />
                  <span>Create Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('Generate video ad script for my campaign')}
                  className="bg-[#27272a] hover:bg-[#3f3f46] text-xs text-zinc-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-zinc-700/50 cursor-pointer transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Create Video</span>
                </button>
              </div>

              {/* Right Section (Send Controls) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  title="Voice Input"
                  className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:hover:bg-zinc-700 disabled:hover:text-zinc-400"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RED ERROR TOAST OVERLAY (Bottom-Left) */}
        {errorMessage && (
          <div className="fixed bottom-4 left-4 z-50 bg-[#3f1315] text-[#fca5a5] border border-[#7f1d1d] rounded-lg px-4 py-3 text-sm flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-2">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="hover:text-white cursor-pointer ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right Live Preview Panel */}
      <div className="w-[420px] bg-[#111111] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden hidden xl:flex">
        <div className="flex border-b border-zinc-800 bg-[#161616]">
          {[
            { id: 'campaign', label: 'Campaign' },
            { id: 'ad', label: 'Ad Preview' },
            { id: 'landing', label: 'Landing Page' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPreviewTab(t.id as any)}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
                previewTab === t.id
                  ? 'border-teal-400 text-teal-300 bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {previewTab === 'campaign' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Live Campaign Structure</span>
                <h3 className="font-bold text-white text-sm">{campaignPreview.name}</h3>
                <div className="text-zinc-400 space-y-1">
                  <p>• Objective: <span className="text-zinc-200">{campaignPreview.objective}</span></p>
                  <p>• Budget: <span className="text-zinc-200">{campaignPreview.budget}</span></p>
                  <p>• Placements: <span className="text-zinc-200">{campaignPreview.placements?.join(', ')}</span></p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Target Audience Matrix</span>
                <h4 className="font-semibold text-zinc-200">Home Decor &amp; Scented Candle Lovers</h4>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-300">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">India (21-45 yrs)</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">Interests: Home Scent</span>
                </div>
              </div>
            </div>
          )}

          {previewTab === 'ad' && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-xs">C</div>
                <div>
                  <p className="font-bold text-white">Candle Craft Co.</p>
                  <p className="text-[10px] text-zinc-400">Sponsored • Meta Ad</p>
                </div>
              </div>
              <p className="text-zinc-200">{adPreview.primary_text}</p>
              <div className="w-full h-44 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                AI Image Preview (Nano Banana)
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                <div>
                  <p className="font-bold text-white">{adPreview.headline}</p>
                  <p className="text-[10px] text-zinc-400">candlecraft.yourapp.com</p>
                </div>
                <button className="px-3 py-1 rounded bg-teal-600 text-white font-bold text-xs">{adPreview.cta}</button>
              </div>
            </div>
          )}

          {previewTab === 'landing' && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Generated Landing Page</span>
              <p className="text-zinc-300">Template: <span className="font-semibold text-white">Product Showcase v2</span></p>
              <div className="w-full h-56 rounded-lg bg-zinc-950 border border-zinc-800 p-3 space-y-2">
                <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                <div className="h-20 w-full bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center text-zinc-500">
                  Product Hero Banner
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
