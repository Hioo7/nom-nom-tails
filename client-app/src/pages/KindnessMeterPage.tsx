import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLoader, FiCheck, FiLock } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { OrderService } from '../services/order.service';
import { paiseToRupees } from '../utils/currency';
import type { Order } from '../types';

const orderService = new OrderService();

const MONTHLY_GOAL = 5000;

const TIERS = [
  { level: 1, label: 'Animal Welfare Friend',    min: 0,      max: 500,   emoji: '🌱', bg: 'bg-green-500' },
  { level: 2, label: 'Animal Welfare Supporter', min: 501,    max: 2500,  emoji: '🤝', bg: 'bg-blue-500' },
  { level: 3, label: 'Animal Welfare Caregiver', min: 2501,   max: 5000,  emoji: '🐕', bg: 'bg-purple-500' },
  { level: 4, label: 'Animal Welfare Protector', min: 5001,   max: 10000, emoji: '🛡️', bg: 'bg-indigo-500' },
  { level: 5, label: 'Animal Welfare Guardian',  min: 10001,  max: 20000, emoji: '🦅', bg: 'bg-rose-500' },
  { level: 6, label: 'Animal Welfare Champion',  min: 20001,  max: 30000, emoji: '🏆', bg: 'bg-amber-500' },
];

function getCurrentTier(total: number) {
  return TIERS.findLast((t) => total >= t.min) ?? TIERS[0];
}

function getNextTier(total: number) {
  return TIERS.find((t) => total < t.min) ?? null;
}

function computeKindness(orders: Order[]) {
  let total = 0;
  for (const order of orders) {
    const items = order.items.reduce((s, i) => s + i.dish.price * i.quantity, 0);
    total += Math.round(paiseToRupees(items) * 0.05);
  }
  return { total, count: orders.length };
}

function KindnessGauge({ percent, id = 'gaugeGrad' }: { percent: number; id?: string }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <svg viewBox="0 0 200 112" className="w-full max-w-[240px] mx-auto">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path d="M 15,100 A 85,85 0 0 1 185,100" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
      <path
        d="M 15,100 A 85,85 0 0 1 185,100"
        fill="none" stroke={`url(#${id})`} strokeWidth="16" strokeLinecap="round"
        pathLength="100" strokeDasharray={`${p} 100`}
        style={{ transition: 'stroke-dasharray 1.2s ease-out' }}
      />
    </svg>
  );
}

// ── Paw SVG ───────────────────────────────────────────────────────────────────

function PawSVG({ filled, pulsing = false, size = 20 }: { filled: boolean; pulsing?: boolean; size?: number }) {
  const color = filled || pulsing ? '#ff6b35' : 'rgba(255,255,255,0.15)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill={color}
      style={{
        transition: 'fill 0.35s ease',
        filter: pulsing
          ? 'drop-shadow(0 0 6px rgba(255,107,53,0.9))'
          : filled
          ? 'drop-shadow(0 1px 3px rgba(255,107,53,0.5))'
          : 'none',
      }}
    >
      <ellipse cx="32" cy="44" rx="14" ry="12" />
      <ellipse cx="14" cy="28" rx="7" ry="9" transform="rotate(-15 14 28)" />
      <ellipse cx="26" cy="22" rx="7" ry="9" transform="rotate(-5 26 22)" />
      <ellipse cx="38" cy="22" rx="7" ry="9" transform="rotate(5 38 22)" />
      <ellipse cx="50" cy="28" rx="7" ry="9" transform="rotate(15 50 28)" />
    </svg>
  );
}

// ── Tier progress track ───────────────────────────────────────────────────────

const TOTAL_PAWS = 12;
const LIFETIME_MAX = 50000;

function TierProgressTrack({ total, currentTier }: { total: number; currentTier: typeof TIERS[0] }) {
  const nextTier = getNextTier(total);
  const rangeStart = currentTier.min;
  const rangeEnd = nextTier ? nextTier.min - 1 : currentTier.max;
  const rangeSize = Math.max(1, rangeEnd - rangeStart);
  const progress = Math.min(1, Math.max(0, (total - rangeStart) / rangeSize));
  const filledCount = progress > 0 ? Math.max(1, Math.round(progress * TOTAL_PAWS)) : 0;
  const remaining = Math.max(0, rangeEnd - total);
  const lifetimePct = Math.min(100, (total / LIFETIME_MAX) * 100);

  const [animatedPaws, setAnimatedPaws] = useState(0);
  const [dogPos, setDogPos] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const reset = setTimeout(() => {
      setAnimatedPaws(0);
      setDogPos(0);
      if (filledCount === 0) return;
      let i = 0;
      interval = setInterval(() => {
        i++;
        setAnimatedPaws(i);
        setDogPos((i / filledCount) * progress * 100);
        if (i >= filledCount) clearInterval(interval);
      }, 90);
    }, 0);
    return () => {
      clearTimeout(reset);
      clearInterval(interval);
    };
  }, [filledCount, progress]);

  return (
    <div className="rounded-3xl px-5 py-5 mb-4" style={{ background: '#1a1a2e' }}>
      {/* Header */}
      <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase text-center mb-3">
        🐾 Nom Nom Tails · Kindness Progress
      </p>

      {/* Current tier pill */}
      <div className="flex justify-center mb-4">
        <div className="rounded-2xl px-5 py-2 text-center" style={{ background: '#1f1008' }}>
          <p className="text-[10px] text-orange-400 font-medium mb-0.5">Current Tier</p>
          <p className="text-sm font-black text-white">{currentTier.label}</p>
        </div>
      </div>

      {/* Range labels */}
      <div className="flex justify-between mb-2 px-1" style={{ fontSize: 10 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>₹{rangeStart.toLocaleString('en-IN')}</span>
        <span style={{ color: '#ff8c42', fontWeight: 800 }}>₹{total.toLocaleString('en-IN')} · you are here</span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>₹{rangeEnd.toLocaleString('en-IN')}</span>
      </div>

      {/* Paw track */}
      <div
        className="relative rounded-[20px] overflow-hidden mb-3"
        style={{ height: 44, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Glow fill */}
        <div
          className="absolute left-0 top-0 bottom-0 rounded-[20px]"
          style={{
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, rgba(255,107,53,0.45), rgba(255,140,66,0.25))',
            transition: 'width 0.09s linear',
          }}
        />
        {/* Paw row */}
        <div className="absolute inset-0 flex items-center px-2.5" style={{ gap: 2 }}>
          {Array.from({ length: TOTAL_PAWS }).map((_, i) => {
            const filled = i < animatedPaws;
            const pulsing = i === animatedPaws && animatedPaws < filledCount;
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className="flex-1 flex justify-center items-center"
                style={{
                  marginTop: isEven ? 4 : -4,
                  transform: `rotate(${isEven ? -18 : 18}deg)`,
                  opacity: filled || pulsing ? 1 : 0.2,
                  transition: `opacity 0.3s ease ${i * 0.06}s`,
                  animation: pulsing ? 'pawPulse 1s ease-in-out infinite' : 'none',
                }}
              >
                <PawSVG filled={filled} pulsing={pulsing} size={18} />
              </div>
            );
          })}
        </div>
        {/* Walking dog */}
        {filledCount > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 text-lg z-10 pointer-events-none"
            style={{
              left: `clamp(0px, calc(${Math.min(dogPos, progress * 100)}% - 10px), calc(100% - 24px))`,
              transition: 'left 0.09s linear',
            }}
          >
            🐕
          </div>
        )}
      </div>

      <style>{`@keyframes pawPulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.35);opacity:1}}`}</style>

      {/* Hint */}
      <p className="text-center mb-5" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
        {nextTier ? (
          <>
            ₹<strong style={{ color: '#ff8c42' }}>{remaining.toLocaleString('en-IN')} more</strong>{' '}
            to become an <strong style={{ color: '#ff8c42' }}>{nextTier.label}</strong> 🐾
          </>
        ) : (
          <strong style={{ color: '#4ade80' }}>🎉 Maximum tier reached!</strong>
        )}
      </p>

      {/* Lifetime progress bar */}
      <div className="relative h-3 rounded-full mb-1" style={{ background: '#2d3748' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ width: `${lifetimePct}%`, background: 'linear-gradient(90deg, #c2410c, #f97316)', transition: 'width 1s ease-out' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-orange-500 bg-white shadow-md"
          style={{ left: `clamp(0px, calc(${lifetimePct}% - 10px), calc(100% - 20px))`, transition: 'left 1s ease-out' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-2">
        <span>₹0</span>
        <span className="text-gray-300 font-medium">Total donated: ₹{total.toLocaleString('en-IN')}</span>
        <span>₹{LIFETIME_MAX.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

// ── Tier journey list ─────────────────────────────────────────────────────────

function KindnessJourney({ total }: { total: number }) {
  const currentTier = getCurrentTier(total);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        🏆 Your Kindness Journey
      </h3>
      <div className="flex flex-col gap-2">
        {TIERS.map((tier) => {
          const isDone = total > tier.max;
          const isCurrent = tier.level === currentTier.level;
          const isLocked = !isDone && !isCurrent;

          return (
            <div
              key={tier.level}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-all ${
                isCurrent
                  ? 'border-orange-400 bg-orange-50'
                  : isDone
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-100 bg-gray-50 opacity-50'
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                isLocked ? 'bg-gray-200' : tier.bg
              }`}>
                {isLocked ? <FiLock size={18} className="text-gray-400" /> : tier.emoji}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold tracking-widest uppercase mb-0.5 ${
                  isCurrent ? 'text-orange-500' : isDone ? 'text-green-600' : 'text-gray-400'
                }`}>
                  Tier {tier.level}{isCurrent ? ' · Current' : ''}
                </p>
                <p className={`text-sm font-bold truncate ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                  {tier.label}
                </p>
                <p className={`text-xs mt-0.5 ${isLocked ? 'text-gray-300' : 'text-gray-500'}`}>
                  ₹{tier.min.toLocaleString('en-IN')} – ₹{tier.max.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Status badge */}
              {isDone && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
                  <FiCheck size={11} strokeWidth={3} /> DONE
                </span>
              )}
              {isCurrent && (
                <span className="text-xs font-bold text-white bg-orange-500 px-2.5 py-1 rounded-full flex-shrink-0">
                  CURRENT
                </span>
              )}
              {isLocked && (
                <span className="text-xs font-semibold text-gray-400 flex-shrink-0">LOCKED</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Guest view ────────────────────────────────────────────────────────────────

function GuestKindnessView() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl px-5 pt-5 pb-4 text-center shadow-sm">
        <p className="text-3xl mb-2">🐾</p>
        <h2 className="text-lg font-black text-gray-900 mb-1">Community Kindness Meter</h2>
        <p className="text-xs text-gray-500 mb-4">Every order automatically donates 5% to stray dog rescue.</p>
        <KindnessGauge percent={68} id="gaugeGradGuest" />
        <p className="text-2xl font-black text-gray-900 -mt-1">₹4,280</p>
        <p className="text-xs font-bold text-orange-600 tracking-widest uppercase mt-0.5 mb-1">Raised this month</p>
        <p className="text-xs text-gray-500">68% of ₹5,000 monthly rescue goal</p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-3">How It Works</p>
        <div className="flex flex-col gap-3">
          {[
            { emoji: '🛒', text: 'Place an order on Nom Nom Tails' },
            { emoji: '✦', text: '5% of your item total is donated automatically — no extra charge' },
            { emoji: '🐕', text: 'Funds go to stray dog rescue, vaccination & medical care' },
            { emoji: '📊', text: 'Track your personal impact and climb the kindness tiers' },
          ].map((s) => (
            <div key={s.emoji} className="flex items-start gap-3">
              <span className="text-lg leading-none">{s.emoji}</span>
              <p className="text-sm text-gray-600 leading-snug">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tier preview (locked) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🏆 Kindness Journey Tiers</h3>
        <div className="flex flex-col gap-2">
          {TIERS.slice(0, 4).map((tier) => (
            <div key={tier.level} className="flex items-center gap-3 rounded-2xl px-4 py-3 border-2 border-gray-100 bg-gray-50 opacity-60">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <FiLock size={14} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Tier {tier.level}</p>
                <p className="text-sm font-bold text-gray-400">{tier.label}</p>
                <p className="text-xs text-gray-300">₹{tier.min.toLocaleString('en-IN')} – ₹{tier.max.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-center text-gray-400 pt-1">+ 2 more tiers to unlock</p>
        </div>
      </div>

      {/* Sign-in CTA */}
      <div className="bg-orange-500 rounded-2xl p-5 text-center text-white">
        <p className="font-bold mb-1">Track Your Personal Journey</p>
        <p className="text-xs text-orange-100 mb-4">Sign in to see your tier, contributions, and climb the kindness ladder.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-orange-600 font-bold py-3 rounded-xl text-sm"
        >
          Sign In to See My Tier
        </button>
      </div>
    </div>
  );
}

// ── Personal view ─────────────────────────────────────────────────────────────

function PersonalKindnessView({ orders }: { orders: Order[] }) {
  const { user } = useAuth();
  const { total: totalContributed, count: orderCount } = computeKindness(orders);

  const dogsHelped = Math.max(0, Math.floor(totalContributed / 100));
  const monthlyPercent = Math.min(100, Math.round((totalContributed / MONTHLY_GOAL) * 100));
  const currentTier = getCurrentTier(totalContributed);
  const firstName = user?.name?.split(' ')[0] ?? 'Your';

  return (
    <div className="flex flex-col gap-4">
      {/* Tier progress track */}
      <TierProgressTrack total={totalContributed} currentTier={currentTier} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Raised', value: `₹${totalContributed.toLocaleString('en-IN')}`, color: 'text-orange-500' },
          { label: 'Orders Made', value: String(orderCount), color: 'text-amber-500' },
          { label: 'Dogs Helped', value: `~${dogsHelped}`, color: 'text-green-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Impact description */}
      {totalContributed > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            {firstName}'s 5% contribution of{' '}
            <span className="font-bold text-orange-600">₹{totalContributed.toLocaleString('en-IN')}</span>{' '}
            has funded emergency medical welfare for injured animals and critical rescue missions.
          </p>
          {dogsHelped > 0 && (
            <p className="text-xs text-gray-500 mt-2 font-medium">
              🐕 Helped fund care for ~{dogsHelped} stray {dogsHelped === 1 ? 'dog' : 'dogs'}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
          <p className="text-3xl mb-2">🛒</p>
          <p className="text-sm font-bold text-gray-700 mb-1">Start your kindness journey!</p>
          <p className="text-xs text-gray-500">Place your first order — 5% goes straight to rescue.</p>
        </div>
      )}

      {/* Tier journey */}
      <KindnessJourney total={totalContributed} />

      {/* Monthly goal */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-medium text-orange-700">Monthly Rescue Goal</span>
          <span className="font-bold text-gray-600">{monthlyPercent}%</span>
        </div>
        <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full"
            style={{ width: `${monthlyPercent}%`, transition: 'width 1s ease-out' }}
          />
        </div>
        <p className="text-xs text-orange-600 mt-2 font-medium">
          ₹{totalContributed.toLocaleString('en-IN')} of ₹{MONTHLY_GOAL.toLocaleString('en-IN')} monthly goal
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function KindnessMeterPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  const loading = !!token && orders === null;

  useEffect(() => {
    if (!token) return;
    orderService.listMine(token)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [token]);

  return (
    <div className="max-w-lg mx-auto px-4 pb-28">
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <FiArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {token ? 'My Kindness Meter' : 'Community Kindness'}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <FiLoader size={18} className="animate-spin" /> Loading your impact…
        </div>
      ) : !token ? (
        <GuestKindnessView />
      ) : (
        <PersonalKindnessView orders={orders ?? []} />
      )}
    </div>
  );
}
