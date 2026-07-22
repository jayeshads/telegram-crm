import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Users as UsersIcon, Search, Shield, Ban, CheckCircle, Eye, X, Building, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status: string;
  funds_frozen: boolean;
  credits_remaining: number;
  created_at: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deepProfile, setDeepProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data: any = await apiRequest(`/admin/users${query}`);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await apiRequest(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFreezeFunds = async (user: User) => {
    try {
      await apiRequest(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ funds_frozen: !user.funds_frozen }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, funds_frozen: !user.funds_frozen } : u))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleInspectUser = async (userId: string) => {
    setSelectedUserId(userId);
    setProfileLoading(true);
    try {
      const data: any = await apiRequest(`/admin/users/${userId}/full-profile`);
      setDeepProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400">View registered users, inspect details, block/unblock or freeze funds</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Funds Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50">
                  <td className="p-4">
                    <p className="font-semibold text-white">{u.full_name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.funds_frozen
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {u.funds_frozen ? 'Frozen' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleInspectUser(u.id)}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => handleToggleFreezeFunds(u)}
                      className="px-3 py-1 bg-amber-600/20 text-amber-400 rounded-lg text-xs hover:bg-amber-600/30"
                    >
                      {u.funds_frozen ? 'Unfreeze Funds' : 'Freeze Funds'}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 rounded-lg text-xs ${
                        u.status === 'active'
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                          : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                      }`}
                    >
                      {u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deep Inspection Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto space-y-4 text-white">
            <button
              onClick={() => {
                setSelectedUserId(null);
                setDeepProfile(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold">Deep Profile Inspection</h2>

            {profileLoading || !deepProfile ? (
              <div className="py-8 text-center text-slate-400">Loading user deep details...</div>
            ) : (
              <div className="space-y-4 text-sm">
                {/* Basic Info */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="font-semibold text-blue-400">User Information</p>
                  <p>Name: {deepProfile.user_info.full_name}</p>
                  <p>Email: {deepProfile.user_info.email}</p>
                  <p>Phone: {deepProfile.user_info.phone || 'N/A'}</p>
                  <p>Password (Encrypted): {deepProfile.user_info.password_view}</p>
                  <p>Role: {deepProfile.user_info.role}</p>
                </div>

                {/* Meta Details */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="font-semibold text-emerald-400">Meta Account Credentials &amp; Limits</p>
                  <p>Connection Status: {deepProfile.meta_account_details.status}</p>
                  <p>Ad Account ID: {deepProfile.meta_account_details.ad_account_id || 'Not connected'}</p>
                  <p>Business Manager ID: {deepProfile.meta_account_details.bm_id || 'Not connected'}</p>
                  <p>Page ID: {deepProfile.meta_account_details.page_id || 'Not connected'}</p>
                  <p>Meta Fund Limits: {deepProfile.meta_account_details.funds_requested_from_meta}</p>
                </div>

                {/* Statistics */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <p className="font-semibold text-purple-400">Usage &amp; Campaigns Activity</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p>Total Campaigns: {deepProfile.statistics.total_campaigns}</p>
                    <p>Active Campaigns: {deepProfile.statistics.active_campaigns}</p>
                    <p>AI Images Generated: {deepProfile.statistics.ai_images_generated}</p>
                    <p>User Images Uploaded: {deepProfile.statistics.user_images_uploaded}</p>
                    <p>Landing Pages Used: {deepProfile.statistics.landing_pages_used}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
