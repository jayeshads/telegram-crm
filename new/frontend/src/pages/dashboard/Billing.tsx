import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Sparkles, Tag, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { apiRequest } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  credits_per_month: number;
  features: string[];
}

export const Billing: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [promo, setPromo] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [subscribingSlug, setSubscribingSlug] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data: any = await apiRequest('/plans');
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promo.trim()) return;
    setPromoLoading(true);
    setPromoMsg(null);
    try {
      const res: any = await apiRequest('/plans/promo/apply', {
        method: 'POST',
        body: JSON.stringify({ code: promo }),
      });
      setAppliedPromo(res);
      setPromoMsg(res.message || 'Promo code applied!');
    } catch (e: any) {
      setAppliedPromo(null);
      setPromoMsg(e.message || 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    setSubscribingSlug(plan.slug);
    setSuccessMsg(null);
    try {
      // 1. Create Razorpay order
      const orderRes: any = await apiRequest('/plans/razorpay/order', {
        method: 'POST',
        body: JSON.stringify({
          plan_slug: plan.slug,
          promo_code: appliedPromo?.code,
        }),
      });

      // 2. Simulate Razorpay Checkout popup / direct verification call
      const verifyRes: any = await apiRequest('/plans/razorpay/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: orderRes.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          plan_slug: plan.slug,
        }),
      });

      setSuccessMsg(verifyRes.message || `Subscribed to ${plan.name}!`);

      // Refresh User details in auth store
      if (setUser && user) {
        setUser({
          ...user,
          credits_remaining: verifyRes.new_credits || (user.credits_remaining + plan.credits_per_month),
        });
      }
    } catch (e: any) {
      console.error(e);
      alert(`Subscription failed: ${e.message}`);
    } finally {
      setSubscribingSlug(null);
    }
  };

  const currentPlanSlug = user?.subscription?.plan_slug || 'free-trial';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing &amp; Subscriptions</h1>
        <p className="text-sm text-slate-400">Manage your subscription plan, AI credit balance, and payments via Razorpay</p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline text-emerald-300">Dismiss</button>
        </div>
      )}

      {/* Current Usage Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-purple-900/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Zap className="w-6 h-6 fill-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Current AI Credit Balance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Used for AI campaign creation, image generation, and copywriting</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">{user?.credits_remaining ?? 100}</span>
            <span className="text-xs text-slate-400 block">Credits Available</span>
          </div>
        </div>
      </div>

      {/* Promo Code Box */}
      <div className="p-4 rounded-2xl bg-[#12121A] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Have a promo code?</h3>
            <p className="text-xs text-slate-400">Try code <span className="font-mono text-blue-400">LAUNCH50</span> for 50% discount</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="e.g. LAUNCH50"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white uppercase"
          />
          <button
            onClick={handleApplyPromo}
            disabled={promoLoading}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
          >
            {promoLoading ? 'Checking...' : 'Apply'}
          </button>
        </div>
      </div>
      {promoMsg && (
        <p className={`text-xs font-semibold ${appliedPromo?.valid ? 'text-emerald-400' : 'text-red-400'}`}>
          {promoMsg}
        </p>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading subscription plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = currentPlanSlug === p.slug;
            const discount = appliedPromo?.valid ? appliedPromo.discount_percent : 0;
            const finalPrice = p.price_inr * (1 - discount / 100);

            return (
              <div
                key={p.slug}
                className={`p-6 rounded-2xl bg-[#12121A] border flex flex-col justify-between space-y-6 relative overflow-hidden ${
                  isCurrent ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Current Plan
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-blue-400 font-semibold mt-1">
                      {p.credits_per_month.toLocaleString()} AI Credits / mo
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{formatCurrency(finalPrice)}</span>
                    {discount > 0 && (
                      <span className="text-xs text-slate-500 line-through mr-1">{formatCurrency(p.price_inr)}</span>
                    )}
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent || subscribingSlug === p.slug}
                  onClick={() => handleSubscribe(p)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500'
                  }`}
                >
                  {subscribingSlug === p.slug ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Razorpay...
                    </>
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    'Upgrade via Razorpay'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
