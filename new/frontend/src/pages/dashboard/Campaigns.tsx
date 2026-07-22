import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  MoreVertical,
  Sparkles,
  Eye,
  Edit,
  Copy,
  Trash2,
  RefreshCw,
  Plus,
  BarChart3,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { CampaignMetricsModal } from '@/components/campaigns/CampaignMetricsModal';
import { CampaignRecommendationsModal } from '@/components/campaigns/CampaignRecommendationsModal';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  budget: { type: string; amount: number };
  metrics_cache: { spend: number; leads: number; cpl: number; cpc: number; roas: number; impressions: number };
  has_recommendation: boolean;
  created_at: string;
}

interface DropdownMenuProps {
  campaign: Campaign;
  onClose: () => void;
  onViewMetrics: () => void;
  onViewRecommendations: () => void;
  onToggle: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  campaign, onClose, onViewMetrics, onViewRecommendations, onToggle, onDuplicate, onDelete,
}) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = [
    { icon: Bot, label: 'Edit with AI', action: () => { navigate('/dashboard/chat'); onClose(); } },
    { icon: BarChart3, label: 'View Metrics', action: () => { onViewMetrics(); onClose(); } },
    { icon: Sparkles, label: 'Check Recommendation', action: () => { onViewRecommendations(); onClose(); } },
    { icon: Eye, label: 'Preview Ad', action: () => { navigate('/dashboard/creatives'); onClose(); } },
    { type: 'divider' },
    { icon: campaign.status === 'active' ? XCircle : CheckCircle, label: campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign', action: () => { onToggle(); onClose(); } },
    { icon: Copy, label: 'Duplicate', action: () => { onDuplicate(); onClose(); } },
    { type: 'divider' },
    { icon: Trash2, label: 'Delete Campaign', action: () => { onDelete(); onClose(); } },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-9 z-50 w-48 rounded-lg bg-[#1e1e1e] border border-[#333333] shadow-xl overflow-hidden py-1"
    >
      {items.map((item, i) =>
        item.type === 'divider' ? (
          <div key={i} className="my-1 border-t border-[#262626]" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#e5e5e5] hover:bg-[#262626] transition-colors"
          >
            {item.icon && <item.icon className="w-3.5 h-3.5 text-[#a3a3a3]" />}
            <span>{item.label}</span>
          </button>
        )
      )}
    </div>
  );
};

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'active' | 'in_review' | 'draft' | 'paused'>('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [metricsModal, setMetricsModal] = useState<Campaign | null>(null);
  const [recoModal, setRecoModal] = useState<Campaign | null>(null);

  useEffect(() => { loadCampaigns(); }, [tab]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const query = tab !== 'all' ? `?status=${tab}` : '';
      const data: any = await apiRequest(`/campaigns${query}`);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated: any = await apiRequest(`/campaigns/${id}/toggle`, { method: 'PATCH' });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (camp: Campaign) => {
    try {
      const body = {
        name: `${camp.name} (Copy)`,
        objective: camp.objective,
        budget: camp.budget,
        placements: ['facebook_feed', 'instagram_feed'],
        adsets: [],
      };
      const newCamp: any = await apiRequest('/campaigns/draft', { method: 'POST', body: JSON.stringify(body) });
      setCampaigns((prev) => [newCamp, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete campaign?')) return;
    try {
      await apiRequest(`/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'in_review', label: 'In Review' },
    { id: 'draft', label: 'Drafts' },
    { id: 'paused', label: 'Paused' },
  ];

  return (
    <>
      <div className="space-y-6 text-[#e5e5e5] font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171717] p-5 rounded-lg border border-[#262626]">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#a3a3a3]" />
              Campaigns
            </h1>
            <p className="text-xs text-[#a3a3a3] mt-1">
              Manage and track your Meta ad campaigns
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/chat')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold border border-[#404040] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#262626] gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id ? 'border-white text-white font-semibold' : 'border-transparent text-[#a3a3a3] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="flex justify-center py-12 text-[#a3a3a3]">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-[#737373] text-xs space-y-2">
            <p>No campaigns found.</p>
            <button onClick={() => navigate('/dashboard/chat')} className="text-white hover:underline">
              Create campaign with AI →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-4 rounded-lg bg-[#171717] border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-[#262626] text-[#a3a3a3]">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{camp.name}</h3>
                    <p className="text-[11px] text-[#a3a3a3] mt-0.5 capitalize">
                      Status: {camp.status} · ₹{camp.budget.amount}/day
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase">Spend</p>
                    <p className="font-semibold text-white">{formatCurrency(camp.metrics_cache?.spend || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase">Leads</p>
                    <p className="font-semibold text-white">{formatNumber(camp.metrics_cache?.leads || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase">CPL</p>
                    <p className="font-semibold text-white">{camp.metrics_cache?.cpl > 0 ? formatCurrency(camp.metrics_cache.cpl) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase">CPC</p>
                    <p className="font-semibold text-white">{camp.metrics_cache?.cpc > 0 ? formatCurrency(camp.metrics_cache.cpc) : '—'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(camp.id)}
                    className="px-3 py-1 rounded bg-[#262626] hover:bg-[#333333] text-xs text-[#e5e5e5] border border-[#333333]"
                  >
                    {camp.status === 'active' ? 'Pause' : 'Resume'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === camp.id ? null : camp.id)}
                      className="p-1.5 rounded bg-[#262626] hover:bg-[#333333] text-[#a3a3a3] hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === camp.id && (
                      <DropdownMenu
                        campaign={camp}
                        onClose={() => setOpenMenu(null)}
                        onViewMetrics={() => setMetricsModal(camp)}
                        onViewRecommendations={() => setRecoModal(camp)}
                        onToggle={() => handleToggleStatus(camp.id)}
                        onDuplicate={() => handleDuplicate(camp)}
                        onDelete={() => handleDelete(camp.id)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {metricsModal && (
        <CampaignMetricsModal campaign={metricsModal} onClose={() => setMetricsModal(null)} />
      )}
      {recoModal && (
        <CampaignRecommendationsModal campaign={recoModal} onClose={() => setRecoModal(null)} />
      )}
    </>
  );
};
