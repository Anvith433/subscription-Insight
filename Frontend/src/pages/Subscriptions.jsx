import { useEffect, useState } from 'react';
import {
  Plus, Search, Trash2, Edit2, X, Check, AlertTriangle,
  CreditCard, Filter,
} from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const CATEGORIES = ['STREAMING', 'MUSIC', 'CLOUD', 'PRODUCTIVITY', 'GAMING', 'FITNESS', 'NEWS', 'OTHER'];
const CYCLES = ['MONTHLY', 'YEARLY', 'WEEKLY'];
const STATUSES = ['Active', 'Paused', 'Cancelled'];

const CAT_COLORS = {
  STREAMING: 'bg-blue-500/20 text-blue-400',
  MUSIC: 'bg-purple-500/20 text-purple-400',
  CLOUD: 'bg-cyan-500/20 text-cyan-400',
  PRODUCTIVITY: 'bg-green-500/20 text-green-400',
  GAMING: 'bg-amber-500/20 text-amber-400',
  FITNESS: 'bg-red-500/20 text-red-400',
  NEWS: 'bg-slate-500/20 text-slate-400',
  OTHER: 'bg-slate-500/20 text-slate-400',
};

const STATUS_COLORS = {
  Active: 'bg-green-500/20 text-green-400',
  Paused: 'bg-yellow-500/20 text-yellow-400',
  Cancelled: 'bg-red-500/20 text-red-400',
};

const emptyForm = {
  providerName: '', category: 'STREAMING', price: '', currency: 'USD',
  renewalCycle: 'MONTHLY', startDate: new Date().toISOString().split('T')[0],
  renewalDate: '', status: 'Active',
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SubscriptionForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.providerName.trim()) e.providerName = 'Name is required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.renewalDate) e.renewalDate = 'Renewal date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, price: parseFloat(form.price) });
  };

  const inputCls = (k) =>
    `w-full bg-slate-700/50 border ${errors[k] ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Service Name *</label>
          <input className={inputCls('providerName')} value={form.providerName} onChange={(e) => set('providerName', e.target.value)} placeholder="e.g. Netflix" />
          {errors.providerName && <p className="text-red-400 text-xs mt-1">{errors.providerName}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
          <select className={inputCls('category')} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
          <select className={inputCls('status')} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Price *</label>
          <input type="number" step="0.01" min="0" className={inputCls('price')} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="9.99" />
          {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Currency</label>
          <select className={inputCls('currency')} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
            {['USD', 'EUR', 'GBP', 'INR', 'CAD'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Billing Cycle</label>
          <select className={inputCls('renewalCycle')} value={form.renewalCycle} onChange={(e) => set('renewalCycle', e.target.value)}>
            {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Start Date *</label>
          <input type="date" className={inputCls('startDate')} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-1">Next Renewal Date *</label>
          <input type="date" className={inputCls('renewalDate')} value={form.renewalDate} onChange={(e) => set('renewalDate', e.target.value)} />
          {errors.renewalDate && <p className="text-red-400 text-xs mt-1">{errors.renewalDate}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
          {saving ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> : <Check className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const load = () => {
    setLoading(true);
    subscriptionAPI.getAll()
      .then((r) => setSubs(r.data || []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = subs.filter((s) => {
    const matchSearch = s.providerName?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || s.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = async (data) => {
    setSaving(true);
    setApiError('');
    try {
      if (editTarget) {
        await subscriptionAPI.update(editTarget.id, data);
      } else {
        await subscriptionAPI.create(data);
      }
      setShowForm(false);
      setEditTarget(null);
      load();
    } catch (e) {
      setApiError(e.response?.data?.message || 'Failed to save subscription.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await subscriptionAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      setApiError('Failed to delete subscription.');
      setDeleteTarget(null);
    }
  };

  const monthlyTotal = subs
    .filter((s) => s.status === 'Active' || s.status === 'ACTIVE')
    .reduce((sum, s) => {
      const price = parseFloat(s.price || 0);
      return sum + (s.renewalCycle === 'YEARLY' ? price / 12 : price);
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-slate-400 text-sm mt-1">
            {subs.length} total · <span className="text-blue-400">${monthlyTotal.toFixed(2)}/mo</span>
          </p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {apiError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
          <AlertTriangle className="w-4 h-4" /> {apiError}
          <button onClick={() => setApiError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriptions…"
            className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {['ALL', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterCat === c ? 'bg-blue-600 text-white' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            {search || filterCat !== 'ALL' ? 'No subscriptions match your filters.' : 'No subscriptions yet. Click "Add Subscription" to get started.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Service', 'Category', 'Price', 'Cycle', 'Next Renewal', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {s.providerName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium">{s.providerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${CAT_COLORS[s.category] || 'bg-slate-500/20 text-slate-400'}`}>
                        {s.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{s.currency}{parseFloat(s.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{s.renewalCycle}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{s.renewalDate || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditTarget(s); setShowForm(true); }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal
          title={editTarget ? `Edit ${editTarget.providerName}` : 'Add Subscription'}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
        >
          <SubscriptionForm
            initial={editTarget ? {
              providerName: editTarget.providerName,
              category: editTarget.category,
              price: editTarget.price,
              currency: editTarget.currency || 'USD',
              renewalCycle: editTarget.renewalCycle,
              startDate: editTarget.startDate || new Date().toISOString().split('T')[0],
              renewalDate: editTarget.renewalDate || '',
              status: editTarget.status,
            } : null}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal title="Delete Subscription" onClose={() => setDeleteTarget(null)}>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-white font-medium">Delete &quot;{deleteTarget.providerName}&quot;?</p>
              <p className="text-slate-400 text-sm mt-1">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-medium transition">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
