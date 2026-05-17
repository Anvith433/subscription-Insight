import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import {
  TrendingDown, AlertTriangle, CheckCircle, Info, Zap, DollarSign, RefreshCw, X,
} from 'lucide-react';
import { subscriptionAPI, recommendationAPI } from '../services/api';

const CATEGORY_COLORS = {
  STREAMING: '#3b82f6', MUSIC: '#8b5cf6', CLOUD: '#06b6d4',
  PRODUCTIVITY: '#10b981', GAMING: '#f59e0b', FITNESS: '#ef4444',
  NEWS: '#6b7280', OTHER: '#94a3b8',
};

const REC_STYLE = {
  CANCEL: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', badge: 'bg-red-500/20 text-red-400' },
  DOWNGRADE: { icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', badge: 'bg-yellow-500/20 text-yellow-400' },
  KEEP: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', badge: 'bg-green-500/20 text-green-400' },
};

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div>
        <p className="text-white font-semibold text-center">{label}</p>
        <p className="text-slate-400 text-xs text-center">Efficiency Score</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [subs, setSubs] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dismissing, setDismissing] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([subscriptionAPI.getAll(), recommendationAPI.getAll()])
      .then(([s, r]) => { setSubs(s.data || []); setRecs(r.data || []); })
      .catch(() => { setSubs([]); setRecs([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const activeSubs = subs.filter((s) => s.status === 'Active' || s.status === 'ACTIVE');

  // Monthly spend per category (bar chart)
  const categorySpend = Object.entries(
    activeSubs.reduce((acc, s) => {
      const cat = s.category || 'OTHER';
      const price = parseFloat(s.price || 0);
      const monthly = s.renewalCycle === 'YEARLY' ? price / 12 : price;
      acc[cat] = (acc[cat] || 0) + monthly;
      return acc;
    }, {})
  ).map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount);

  // Pie: active vs inactive
  const statusData = [
    { name: 'Active', value: subs.filter((s) => s.status === 'Active' || s.status === 'ACTIVE').length },
    { name: 'Paused', value: subs.filter((s) => s.status === 'Paused' || s.status === 'PAUSED').length },
    { name: 'Cancelled', value: subs.filter((s) => s.status === 'Cancelled' || s.status === 'CANCELLED').length },
  ].filter((d) => d.value > 0);

  // Radar: category count
  const radarData = Object.entries(
    activeSubs.reduce((acc, s) => { acc[s.category || 'OTHER'] = (acc[s.category || 'OTHER'] || 0) + 1; return acc; }, {})
  ).map(([subject, A]) => ({ subject, A }));

  // Waste score
  const cancelCount = recs.filter((r) => r.type === 'CANCEL').length;
  const wasteScore = activeSubs.length > 0
    ? Math.max(0, 100 - Math.round((cancelCount / activeSubs.length) * 100))
    : 100;

  // Potential savings
  const potentialSavings = recs
    .filter((r) => r.type === 'CANCEL' || r.type === 'DOWNGRADE')
    .reduce((sum, r) => sum + parseFloat(r.potentialSavings || 0), 0);

  const monthlyTotal = activeSubs.reduce((sum, s) => {
    const p = parseFloat(s.price || 0);
    return sum + (s.renewalCycle === 'YEARLY' ? p / 12 : p);
  }, 0);

  const filteredRecs = activeFilter === 'ALL'
    ? recs
    : recs.filter((r) => r.type === activeFilter);

  const handleDismiss = async (id) => {
    setDismissing(id);
    try {
      await recommendationAPI.dismiss(id);
      setRecs((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Silently ignore dismiss failures
    } finally {
      setDismissing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading analytics…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Recommendations</h1>
          <p className="text-slate-400 text-sm mt-1">Understand your spending and optimize your subscriptions.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Score + key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex items-center justify-center">
          <ScoreRing score={wasteScore} />
        </div>
        {[
          { icon: DollarSign, label: 'Monthly Spend', value: `$${monthlyTotal.toFixed(2)}`, color: 'text-blue-400' },
          { icon: TrendingDown, label: 'Potential Savings', value: `$${potentialSavings.toFixed(2)}/mo`, color: 'text-green-400' },
          { icon: Zap, label: 'Recommendations', value: recs.length, color: 'text-amber-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spend by category */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Monthly Spend by Category</h2>
          {categorySpend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categorySpend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v, n, p) => [`$${v}`, 'Monthly']}
                  labelStyle={{ color: '#f1f5f9' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {categorySpend.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              <div className="text-center"><Info className="w-8 h-8 mx-auto mb-2 opacity-50" />No data yet</div>
            </div>
          )}
        </div>

        {/* Status pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Subscription Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.name === 'Active' ? '#10b981' : entry.name === 'Paused' ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No subscriptions</div>
          )}
        </div>
      </div>

      {/* Radar (if enough categories) */}
      {radarData.length >= 3 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Subscription Category Distribution</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar name="Count" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations list */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-semibold text-white">Recommendations ({recs.length})</h2>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'CANCEL', 'DOWNGRADE', 'KEEP'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredRecs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            {recs.length === 0 ? 'No recommendations yet. Add subscriptions and usage data to generate insights.' : 'No recommendations for this filter.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecs.map((r) => {
              const style = REC_STYLE[r.type] || REC_STYLE.KEEP;
              const Icon = style.icon;
              const sub = subs.find((s) => s.id === (r.subscription?.id || r.subscriptionId));
              return (
                <div key={r.id} className={`flex items-start gap-4 p-4 rounded-xl border ${style.bg}`}>
                  <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${style.badge}`}>{r.type}</span>
                      <span className="text-white font-medium text-sm">{sub?.providerName || 'Subscription'}</span>
                      {r.confidenceScore && (
                        <span className="text-slate-500 text-xs">{Math.round(r.confidenceScore * 100)}% confidence</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm mt-1">{r.reason || 'Based on your usage patterns.'}</p>
                    {sub && (
                      <p className="text-slate-500 text-xs mt-1">
                        {sub.currency || '$'}{parseFloat(sub.price).toFixed(2)}/{sub.renewalCycle?.toLowerCase()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismiss(r.id)}
                    disabled={dismissing === r.id}
                    className="text-slate-500 hover:text-slate-300 transition p-1 shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
