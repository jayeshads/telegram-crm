import React, { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Search, Globe, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

export const Research: React.FC = () => {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [competitorData, setCompetitorData] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('candles');
  const [searchLoading, setSearchLoading] = useState(false);
  const [adLibraryResults, setAdLibraryResults] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyzeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorUrl.trim()) return;

    setUrlLoading(true);
    try {
      const res: any = await apiRequest('/scraper/competitor', {
        method: 'POST',
        body: JSON.stringify({ url: competitorUrl }),
      });
      setCompetitorData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSearchAdLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res: any = await apiRequest(`/scraper/ad-library?q=${encodeURIComponent(searchQuery)}`);
      setAdLibraryResults(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Competitor &amp; Meta Ad Library Research</h1>
        <p className="text-sm text-slate-400">Scrape competitor landing pages and discover winning Meta Ad Library copy formats for your niche</p>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Competitor Landing Page Scraper */}
        <div className="p-6 rounded-2xl bg-[#12121A] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Competitor Landing Page Scraper</h2>
          </div>

          <form onSubmit={handleAnalyzeUrl} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. competitor.com or https://site.com"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={urlLoading || !competitorUrl.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5"
            >
              {urlLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Analyze Site'}
            </button>
          </form>

          {competitorData && (
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Page Title</p>
                <p className="text-sm font-bold text-white">{competitorData.title}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Extracted Headlines</p>
                <div className="space-y-1">
                  {competitorData.headlines?.length > 0 ? (
                    competitorData.headlines.map((h: string, i: number) => (
                      <p key={i} className="text-xs text-slate-300 bg-slate-950 p-2 rounded border border-white/5">
                        "{h}"
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No headlines found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Meta Ad Library Search */}
        <div className="p-6 rounded-2xl bg-[#12121A] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Winning Meta Ad Library Insights</h2>
          </div>

          <form onSubmit={handleSearchAdLibrary} className="flex gap-2">
            <input
              type="text"
              placeholder="Search niche (e.g. candles, fitness, d2c)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5"
            >
              {searchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search Insights'}
            </button>
          </form>

          <div className="space-y-3">
            {adLibraryResults.length > 0 ? (
              adLibraryResults.map((ad) => (
                <div key={ad.id} className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">{ad.page_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono">
                      Active {ad.days_active}d
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">Hook: "{ad.hook}"</p>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-2 rounded border border-white/5">
                    {ad.primary_text}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500">Format: {ad.format}</span>
                    <button
                      onClick={() => copyToClipboard(ad.primary_text, ad.id)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {copiedId === ad.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === ad.id ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                Click "Search Insights" to see winning ad hooks for your niche.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
