import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CAT_COLORS = {
  STREAMING: 'bg-blue-500', MUSIC: 'bg-purple-500', CLOUD: 'bg-cyan-500',
  PRODUCTIVITY: 'bg-green-500', GAMING: 'bg-amber-500', FITNESS: 'bg-red-500',
  NEWS: 'bg-slate-500', OTHER: 'bg-slate-600',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Returns upcoming payments within the next 30 days from a list of active subs
function getUpcomingPayments(subs, year, month) {
  const result = {};
  subs
    .filter((s) => s.status === 'Active' || s.status === 'ACTIVE')
    .forEach((s) => {
      if (!s.renewalDate) return;
      const d = new Date(s.renewalDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!result[day]) result[day] = [];
        result[day].push(s);
      }
    });
  return result;
}

export default function PaymentCalendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    subscriptionAPI.getAll()
      .then((r) => setSubs(r.data || []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelected(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelected(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const paymentMap = getUpcomingPayments(subs, currentYear, currentMonth);

  // Upcoming 5 payments (sorted by date)
  const allUpcoming = subs
    .filter((s) => (s.status === 'Active' || s.status === 'ACTIVE') && s.renewalDate)
    .map((s) => ({ ...s, _date: new Date(s.renewalDate) }))
    .filter((s) => s._date >= today)
    .sort((a, b) => a._date - b._date);

  const daysUntil = (date) => {
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `in ${diff} days`;
  };

  // Total spend this calendar month
  const monthlyTotal = (paymentMap
    ? Object.values(paymentMap).flat().reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
    : 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Calendar</h1>
        <p className="text-slate-400 text-sm mt-1">See when your subscriptions renew.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h2 className="text-white font-semibold">{MONTHS[currentMonth]} {currentYear}</h2>
              <p className="text-slate-400 text-xs">{Object.keys(paymentMap).length} payments · ${monthlyTotal.toFixed(2)}</p>
            </div>
            <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const payments = paymentMap[day] || [];
                const isSelected = selected === day;
                return (
                  <div
                    key={day}
                    onClick={() => setSelected(payments.length > 0 ? (isSelected ? null : day) : null)}
                    className={`relative min-h-14 p-1.5 rounded-lg border transition cursor-default ${
                      isToday(day)
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : isSelected
                        ? 'border-blue-400/30 bg-slate-700/50'
                        : payments.length > 0
                        ? 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50 cursor-pointer'
                        : 'border-transparent hover:bg-slate-700/20'
                    }`}
                  >
                    <span className={`text-xs font-medium ${isToday(day) ? 'text-blue-400' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    {/* Payment dots */}
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {payments.slice(0, 3).map((p, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${CAT_COLORS[p.category] || 'bg-slate-500'}`}
                          title={p.providerName}
                        />
                      ))}
                      {payments.length > 3 && (
                        <span className="text-slate-500 text-xs">+{payments.length - 3}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected day detail */}
          {selected && paymentMap[selected] && (
            <div className="mt-4 border-t border-slate-700/50 pt-4">
              <h3 className="text-white font-medium text-sm mb-3">
                {MONTHS[currentMonth]} {selected} — {paymentMap[selected].length} payment{paymentMap[selected].length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-2">
                {paymentMap[selected].map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-700/40 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${CAT_COLORS[s.category] || 'bg-slate-500'}`} />
                      <span className="text-white text-sm">{s.providerName}</span>
                      <span className="text-slate-500 text-xs">{s.category}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{s.currency || '$'}{parseFloat(s.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming payments */}
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Upcoming Renewals
            </h2>
            {allUpcoming.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No upcoming renewals found. Make sure subscriptions have a renewal date set.
              </div>
            ) : (
              <div className="space-y-3">
                {allUpcoming.slice(0, 8).map((s) => {
                  const urgency = Math.ceil((s._date - today) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${urgency <= 3 ? 'bg-red-500' : urgency <= 7 ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{s.providerName}</p>
                        <p className={`text-xs ${urgency <= 3 ? 'text-red-400' : urgency <= 7 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {daysUntil(s._date)}
                        </p>
                      </div>
                      <span className="text-white text-sm font-semibold shrink-0">
                        {s.currency || '$'}{parseFloat(s.price).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly summary */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" /> This Month
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Payments due</span>
                <span className="text-white font-medium">{Object.keys(paymentMap).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total amount</span>
                <span className="text-white font-medium">${monthlyTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yearly projection</span>
                <span className="text-blue-400 font-medium">
                  ${(subs.filter((s) => s.status === 'Active' || s.status === 'ACTIVE').reduce((sum, s) => {
                    const p = parseFloat(s.price || 0);
                    return sum + (s.renewalCycle === 'YEARLY' ? p / 12 : p);
                  }, 0) * 12).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
