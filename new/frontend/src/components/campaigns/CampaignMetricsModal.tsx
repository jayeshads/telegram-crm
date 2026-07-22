import React, { useState, useEffect, useCallback } from 'react';
import { X, DollarSign, Users, MousePointer, Target, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  budget: { type: string; amount: number };
}

interface DailyData {
  date: string;
  spend: number;
  leads: number;
  clicks: number;
  impressions: number;
  cpl: number;
  cpc: number;
}

interface Insights {
  summary: {
    spend: number;
    leads: number;
    clicks: number;
    impressions: number;
    cpl: number;
    cpc: number;
  };
  daily: DailyData[];
}

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

export const CampaignMetricsModal: React.FC<Props> = ({ campaign, onClose }) => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest(`/analytics/campaigns/${campaign.id}/insights?date_preset=last_30d`);
      setInsights(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  const s = insights?.summary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-[#e5e5e5] font-sans">
      <div className="relative w-full max-w-2xl rounded-lg bg-[#171717] border border-[#262626] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">{campaign.name}</h2>
            <p className="text-xs text-[#a3a3a3]">Campaign Analytics Overview</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#a3a3a3] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#a3a3a3]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span>Loading analytics…</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-[#1e1e1e] border border-[#262626]">
                <p className="text-[10px] text-[#737373] uppercase">Spend</p>
                <p className="text-base font-bold text-white mt-1">{formatCurrency(s?.spend || 0)}</p>
              </div>
              <div className="p-3 rounded bg-[#1e1e1e] border border-[#262626]">
                <p className="text-[10px] text-[#737373] uppercase">Leads</p>
                <p className="text-base font-bold text-white mt-1">{formatNumber(s?.leads || 0)}</p>
              </div>
              <div className="p-3 rounded bg-[#1e1e1e] border border-[#262626]">
                <p className="text-[10px] text-[#737373] uppercase">CPL</p>
                <p className="text-base font-bold text-white mt-1">{formatCurrency(s?.cpl || 0)}</p>
              </div>
              <div className="p-3 rounded bg-[#1e1e1e] border border-[#262626]">
                <p className="text-[10px] text-[#737373] uppercase">CPC</p>
                <p className="text-base font-bold text-white mt-1">{formatCurrency(s?.cpc || 0)}</p>
              </div>
            </div>

            <div className="p-3 rounded bg-[#1e1e1e] border border-[#262626] space-y-1">
              <p className="font-semibold text-white">Campaign Details</p>
              <p className="text-[#a3a3a3]">Objective: {campaign.objective}</p>
              <p className="text-[#a3a3a3]">Daily Budget: ₹{campaign.budget.amount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
