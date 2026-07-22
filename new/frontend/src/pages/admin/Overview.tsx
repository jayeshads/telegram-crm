import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { Users, Megaphone, Image as ImageIcon, Ticket, ShieldAlert } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const users: any = await apiRequest('/admin/users');
      const tickets: any = await apiRequest('/admin/support-tickets');
      
      setStats({
        totalUsers: users.length || 0,
        activeUsers: users.filter((u: any) => u.status === 'active').length || 0,
        blockedUsers: users.filter((u: any) => u.status === 'blocked').length || 0,
        openTickets: tickets.filter((t: any) => t.status === 'open').length || 0,
        recentUsers: users.slice(0, 5),
        recentTickets: tickets.slice(0, 5),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-400">Loading Admin Dashboard...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-sm text-slate-400">Platform-wide activity, users, and support overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500">{stats?.activeUsers || 0} Active, {stats?.blockedUsers || 0} Blocked</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Support Tickets</span>
            <Ticket className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.openTickets || 0}</p>
          <p className="text-xs text-slate-500">Open asset setup alerts</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">AI Knowledge</span>
            <ImageIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">Active</p>
          <p className="text-xs text-slate-500">Skills &amp; Prompt Files Loaded</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">System Health</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">100% Online</p>
          <p className="text-xs text-slate-500">FastAPI &amp; MongoDB Mock Active</p>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Registered Users</h2>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {stats?.recentUsers?.length === 0 ? (
              <p className="text-xs text-slate-500">No users found.</p>
            ) : (
              stats?.recentUsers?.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-white">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Support Tickets */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Auto Support Alerts</h2>
            <button
              onClick={() => navigate('/admin/support-tickets')}
              className="text-xs text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {stats?.recentTickets?.length === 0 ? (
              <p className="text-xs text-slate-500">No open support tickets.</p>
            ) : (
              stats?.recentTickets?.map((t: any) => (
                <div key={t.id} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400">{t.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{t.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
