import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Ticket, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  status: string;
  priority: string;
  description: string;
  created_at: string;
}

export const AdminSupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest('/admin/support-tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/admin/support-tickets/${id}?status=${newStatus}`, {
        method: 'PATCH',
      });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Automated Support Tickets</h1>
        <p className="text-sm text-slate-400">Manage support alerts generated during Meta onboarding diagnostics</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No support tickets found. All user asset setups are running smooth!</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{t.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold uppercase">
                    {t.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-400">{t.description}</p>
                <p className="text-[10px] text-slate-500">User ID: {t.user_id}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                  t.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {t.status}
                </span>

                {t.status === 'open' ? (
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'resolved')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(t.id, 'open')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
