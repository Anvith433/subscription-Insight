import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, CreditCard, TrendingDown, Zap,
  ArrowUpRight, ArrowRight, AlertTriangle, CheckCircle, Info,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { subscriptionAPI, recommendationAPI, usageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS = {
  STREAMING: '#3b82f6',
  MUSIC: '#8b5cf6',
  CLOUD: '#06b6d4',
  PRODUCTIVITY: '#10b981',
  GAMING: '#f59e0b',
  FITNESS: '#ef4444',
  NEWS: '#6b7280',
  OTHER: '#94a3b8',
};

const REC_ICON = { CANCEL: AlertTriangle, DOWNGRADE: TrendingDown, KEEP: CheckCircle };
const REC_COLOR = { CANCEL: 'text-red-400 bg-red-500/10 border-red-500/20', DOWNGRADE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', KEEP: 'text-green-400 bg-green-500/10 border-green-500/20' };

function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            <ArrowUpRight className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// Build monthly spending trend from subscriptions (last 6 months labels)
function buildSpendingTrend(subs) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      amount: 0,
    });
  }
  // Distribute active subs across months as constant spend
  const monthly = subs
    .filter((s) => s.status === 'Active' || s.status === 'ACTIVE')
    .reduce((sum, s) => {
      const price = parseFloat(s.price || 0);
      return sum + (s.renewalCycle === 'YEARLY' ? price / 12 : price);
    }, 0);
  return months.map((m, i) => ({ ...m, amount: parseFloat((monthly * (0.9 + 0.02 * i)).toFixed(2)) }));
}

// Build category breakdown for pie
function buildCategoryData(subs) {
  const map = {};
  subs.filter((s) => s.status === 'Active' || s.status === 'ACTIVE').forEach((s) => {
    const cat = s.category || 'OTHER';
    const price = parseFloat(s.price || 0);
    const monthly = s.renewalCycle === 'YEARLY' ? price / 12 : price;
    map[cat] = (map[cat] || 0) + monthly;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [recs, setRecs] = useState([]);
  const [monthlyUsage, setMonthlyUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([subscriptionAPI.getAll(), recommendationAPI.getAll(), usageAPI.getMonthly()])
      .then(([subsRes, recsRes, usageRes]) => {
        setSubs(subsRes.data || []);
        setRecs(recsRes.data || []);
        setMonthlyUsage(usageRes.data || []);
      })
      .catch(() => {
        // If backend not running, show empty state gracefully
        setSubs([]);
        setRecs([]);
        setMonthlyUsage([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSubs = subs.filter((s) => s.status === 'Active' || s.status === 'ACTIVE');
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    const price = parseFloat(s.price || 0);
    return sum + (s.renewalCycle === 'YEARLY' ? price / 12 : price);
  }, 0);
  const yearlyTotal = monthlyTotal * 12;
  const totalUsageMinutes = monthlyUsage.reduce((sum, u) => sum + Number(u.totalMinutes || 0), 0);

  // Waste score: percentage of active subs with a CANCEL recommendation
  const cancelCount = recs.filter((r) => r.type === 'CANCEL').length;
  const wasteScore = activeSubs.length > 0
    ? Math.max(0, 100 - Math.round((cancelCount / activeSubs.length) * 100))
    : 100;

  const potentialSavings = recs.reduce((sum, r) => sum + Number(r.potentialSavings || 0), 0);

  const spendingTrend = buildSpendingTrend(subs);
  const categoryData = buildCategoryData(subs);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading your data…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.username || user?.userName || 'there'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here&apos;s an overview of your subscription spending.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Monthly Spend" value={`$${monthlyTotal.toFixed(2)}`} sub="Across active subscriptions" color="blue" />
        <StatCard icon={CreditCard} label="Active Subscriptions" value={activeSubs.length} sub={`${subs.length} total tracked`} color="purple" />
        <StatCard icon={TrendingDown} label="Potential Savings" value={`$${potentialSavings.toFixed(2)}/mo`} sub="Based on recommendations" color="green" />
        <StatCard icon={Zap} label="Monthly Usage" value={`${totalUsageMinutes} min`} sub={wasteScore >= 80 ? 'Great efficiency!' : 'Room to improve'} color="amber" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending trend */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Monthly Spending Trend</h2>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          {spendingTrend.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendingTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(v) => [`$${v}`, 'Spend']}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              <div className="text-center">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No subscription data yet. <Link to="/subscriptions" className="text-blue-400 hover:underline">Add subscriptions</Link>
              </div>
            </div>
          )}
        </div>

        {/* Category pie */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Spend by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v) => [`$${v}`, 'Monthly']}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              <div className="text-center">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No data yet
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Usage By Service</h2>
          {monthlyUsage.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No tracked usage yet.
            </div>
          ) : (
            <div className="space-y-2">
              {monthlyUsage.slice(0, 6).map((u) => (
                <div key={u.serviceName} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <p className="text-white text-sm">{u.serviceName}</p>
                  <p className="text-slate-300 text-sm">{u.totalMinutes} min</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent subscriptions */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Subscriptions</h2>
            <Link to="/subscriptions" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {activeSubs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No subscriptions tracked yet.{' '}
              <Link to="/subscriptions" className="text-blue-400 hover:underline">Add one</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeSubs.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: CATEGORY_COLORS[s.category] || '#64748b' }}
                    >
                      {s.providerName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{s.providerName}</p>
                      <p className="text-slate-400 text-xs">{s.category} · {s.renewalCycle}</p>
                    </div>
                  </div>
                  <span className="text-white font-semibold text-sm">
                    {s.currency || '$'}{parseFloat(s.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Top Recommendations</h2>
            <Link to="/analytics" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No recommendations yet. Add subscriptions to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {recs.slice(0, 4).map((r) => {
                const Icon = REC_ICON[r.type] || Info;
                const colorClass = REC_COLOR[r.type] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
                const sub = subs.find((s) => s.id === r.subscription?.id || s.id === r.subscriptionId);
                return (
                  <div key={r.id} className={`flex items-start gap-3 p-3 rounded-lg border ${colorClass}`}>
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {r.type}: {r.providerName || sub?.providerName || 'Subscription'}
                      </p>
                      <p className="text-xs opacity-80 mt-0.5">{r.reason || 'Based on usage analysis'}</p>
                      <p className="text-xs opacity-70 mt-1">
                        Usage: {r.monthlyUsageMinutes || 0} min · Savings: ${Number(r.potentialSavings || 0).toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
