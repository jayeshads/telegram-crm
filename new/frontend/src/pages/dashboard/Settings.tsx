import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { apiRequest } from '@/lib/api';
import { Save, User, Building, Phone } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [workspaceName, setWorkspaceName] = useState(user?.workspace?.name || '');
  const [msg, setMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated: any = await apiRequest('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: fullName,
          phone,
          workspace_name: workspaceName,
        }),
      });
      setUser(updated);
      setMsg('Profile updated successfully!');
    } catch (err: any) {
      setMsg(err.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Workspace Settings</h1>
        <p className="text-sm text-slate-400">Update your profile details and agency workspace configuration</p>
      </div>

      {msg && <p className="text-xs text-emerald-400 font-semibold">{msg}</p>}

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#12121A] border border-white/10 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Workspace Name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </form>
    </div>
  );
};
