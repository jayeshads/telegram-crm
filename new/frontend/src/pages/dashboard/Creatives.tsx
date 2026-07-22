import React, { useState, useEffect } from 'react';
import { Image, Upload, Sparkles, Filter, Trash2, Download, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export const Creatives: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'ai' | 'uploaded'>('all');
  const [creatives, setCreatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    loadCreatives();
  }, [filter]);

  const loadCreatives = async () => {
    setLoading(true);
    try {
      const query = filter !== 'all' ? `?source=${filter}` : '';
      const data: any = await apiRequest(`/creatives${query}`);
      setCreatives(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setGenLoading(true);
    try {
      const newCreative: any = await apiRequest('/creatives/generate/image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Premium organic soy wax candles in warm cozy aesthetic lighting',
          model_choice: 'nano_banana',
        }),
      });
      setCreatives((prev) => [newCreative, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setGenLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/creatives/${id}`, { method: 'DELETE' });
      setCreatives((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Creative Library</h1>
          <p className="text-sm text-slate-400">View AI-generated and user-uploaded ad visual creatives</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateImage}
            disabled={genLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {genLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{genLoading ? 'Generating...' : 'Generate AI Visual'}</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {['all', 'ai', 'uploaded'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all ${
              filter === f
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {f === 'ai' ? 'AI Generated' : f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creatives.map((c) => (
            <div key={c.id} className="group rounded-2xl bg-[#12121A] border border-white/10 overflow-hidden space-y-2">
              <div className="h-48 bg-slate-900 relative overflow-hidden">
                {c.url ? (
                  <img src={c.url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Text Creative</div>
                )}
                <span className={`absolute top-2 left-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md backdrop-blur-md border ${
                  c.source === 'ai'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {c.source === 'ai' ? '✨ AI Generated' : 'User Upload'}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">{c.name}</h3>
                  <span className="text-[10px] text-slate-400 uppercase">{c.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
