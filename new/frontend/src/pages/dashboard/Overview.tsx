import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  MousePointer,
  Target,
  Bot,
  Sparkles,
  RefreshCw,
  Megaphone,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

interface KPI {
  total_spend: number;
  total_leads: number;
  avg_cpl: number;
  avg_cpc: number;
  roas: number;
  active_campaigns: number;
  in_review_campaigns: number;
}

interface TopCampaign {
  id: string;
  name: string;
  status: string;
  spend: number;
  leads: number;
  cpl: number;
  has_recommendation: boolean;
}

interface OverviewData {
  kpis: KPI;
  top_campaigns: TopCampaign[];
  last_updated: string;
}

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState(30);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = async (days: number) => {
    setLoading(true);
    try {
      const result: any = await apiRequest(`/analytics/overview?days=${days}`);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOverview(timeRange); }, [timeRange]);

  const kpis = data?.kpis;

  const kpiCards = kpis
    ? [
        { title: 'Total Ad Spend', value: formatCurrency(kpis.total_spend), sub: 'Across all campaigns', icon: DollarSign },
        { title: 'Leads Generated', value: formatNumber(kpis.total_leads), sub: 'From Meta campaigns', icon: Users },
        { title: 'Cost Per Lead (CPL)', value: formatCurrency(kpis.avg_cpl), sub: kpis.avg_cpl < 200 ? 'Below benchmark' : 'Above benchmark', icon: Target },
        { title: 'Cost Per Click (CPC)', value: formatCurrency(kpis.avg_cpc), sub: 'Average across campaigns', icon: MousePointer },
        { title: 'ROAS', value: `${kpis.roas.toFixed(2)}x`, sub: 'Return on ad spend', icon: TrendingUp },
        { title: 'Active Campaigns', value: kpis.active_campaigns.toString(), sub: `${kpis.in_review_campaigns} in review`, icon: Bot },
      ]
    : [];

  return (
    <div className="space-y-6 text-[#e5e5e5] font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171717] p-5 rounded-lg border border-[#262626]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Dashboard Overview
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#262626] text-[#a3a3a3] border border-[#333333] font-mono">
              Live Data
            </span>
          </h1>
          <p className="text-xs text-[#a3a3a3] mt-1">
            Track campaign metrics and AI performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range */}
          <div className="flex items-center bg-[#1e1e1e] border border-[#262626] rounded-lg p-1 text-xs">
            {[
              { v: 7, l: '7d' },
              { v: 30, l: '30d' },
              { v: 90, l: '90d' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setTimeRange(v)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  timeRange === v ? 'bg-[#333333] text-white' : 'text-[#a3a3a3] hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadOverview(timeRange)}
            disabled={loading}
            className="p-2 rounded-lg bg-[#262626] border border-[#333333] text-[#a3a3a3] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/dashboard/chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-semibold border border-[#404040] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-[#171717] border border-[#262626] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg bg-[#171717] border border-[#262626] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#a3a3a3]">{kpi.title}</span>
                  <div className="p-1.5 rounded bg-[#262626] text-[#a3a3a3]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
                  <p className="text-xs text-[#737373] mt-1">{kpi.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Campaigns */}
        <div className="p-5 rounded-lg bg-[#171717] border border-[#262626] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#a3a3a3]" />
              <h2 className="text-sm font-bold text-white">Top Campaigns</h2>
            </div>
            <button
              onClick={() => navigate('/dashboard/campaigns')}
              className="text-xs text-[#a3a3a3] hover:text-white flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {(data?.top_campaigns || []).length === 0 ? (
            <div className="py-6 text-center text-[#737373] text-xs">
              No campaigns yet.{' '}
              <button onClick={() => navigate('/dashboard/chat')} className="text-white hover:underline">
                Create one →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {(data?.top_campaigns || []).map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => navigate('/dashboard/campaigns')}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] hover:bg-[#262626] border border-[#262626] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a3a3a3] flex-shrink-0" />
                    <span className="text-xs text-white font-medium truncate">{camp.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs flex-shrink-0">
                    <span className="text-[#a3a3a3]">{formatNumber(camp.leads)} leads</span>
                    <span className="text-white font-semibold">{formatCurrency(camp.spend)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations Panel */}
        <div className="p-5 rounded-lg bg-[#171717] border border-[#262626] space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a3a3a3]" />
            <h2 className="text-sm font-bold text-white">AI Recommendations</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Scale high-performing ad sets',
                desc: 'CPL is lower than benchmark. Increase daily budget.',
                cta: 'View Campaign',
                onClick: () => navigate('/dashboard/campaigns'),
              },
              {
                title: 'Refresh Ad Creative #3',
                desc: 'CTR is dropping. AI can generate new image variants.',
                cta: 'Open AI Chat',
                onClick: () => navigate('/dashboard/chat'),
              },
            ].map((rec, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#1e1e1e] border border-[#262626] space-y-2">
                <h3 className="text-xs font-semibold text-white">{rec.title}</h3>
                <p className="text-xs text-[#a3a3a3]">{rec.desc}</p>
                <button
                  onClick={rec.onClick}
                  className="text-xs font-medium px-3 py-1 rounded bg-[#262626] hover:bg-[#333333] text-white border border-[#404040] transition-colors"
                >
                  {rec.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
