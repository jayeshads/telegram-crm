import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  name: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  action_type: string | null;
  action_value: any;
}

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

export const CampaignRecommendationsModal: React.FC<Props> = ({ campaign, onClose }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const loadRecs = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest(`/analytics/campaigns/${campaign.id}/recommendations`);
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [campaign.id]);

  useEffect(() => { loadRecs(); }, [loadRecs]);

  const handleApply = async (rec: Recommendation) => {
    if (!rec.action_type || applied.has(rec.id)) return;

    if (rec.action_type === 'open_chat' || rec.action_type === 'generate_creatives') {
      navigate('/dashboard/chat');
      onClose();
      return;
    }

    try {
      await apiRequest(`/analytics/campaigns/${campaign.id}/apply-recommendation`, {
        method: 'POST',
        body: JSON.stringify({ action_type: rec.action_type, action_value: rec.action_value }),
      });
      setApplied((prev) => new Set([...prev, rec.id]));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm text-[#e5e5e5] font-sans">
      <div className="relative w-full max-w-xl rounded-lg bg-[#171717] border border-[#262626] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div>
            <h2 className="text-base font-bold text-white">AI Recommendations</h2>
            <p className="text-xs text-[#a3a3a3]">{campaign.name}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#a3a3a3] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#a3a3a3]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <span>Analyzing performance…</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-8 text-center text-[#737373] text-xs">No recommendations for this campaign.</div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isApplied = applied.has(rec.id);
              return (
                <div key={rec.id} className="p-4 rounded-lg bg-[#1e1e1e] border border-[#262626] space-y-2">
                  <h3 className="text-xs font-bold text-white">{rec.title}</h3>
                  <p className="text-xs text-[#a3a3a3]">{rec.description}</p>
                  {rec.action_type && (
                    <button
                      onClick={() => handleApply(rec)}
                      disabled={isApplied}
                      className="px-3 py-1 rounded bg-[#262626] hover:bg-[#333333] text-xs text-white border border-[#404040] transition-colors"
                    >
                      {isApplied ? 'Applied ✓' : 'Apply Recommendation'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
