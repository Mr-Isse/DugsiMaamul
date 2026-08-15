import { useState, useMemo } from 'react';
import {
  Lightbulb, Plus, Search, ThumbsUp, Edit3, X, CheckCircle, Clock, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetSuggestionsQuery,
  useCreateSuggestionMutation,
  useUpvoteSuggestionMutation,
  useUpdateSuggestionMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Under Review', 'Implemented', 'Rejected', 'Under Consideration'];
const CATEGORIES = ['Academic', 'Facilities', 'Technology', 'Activities', 'Other'];

const STATUS_COLORS = {
  'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Implemented: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Under Consideration': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const SuggestionModal = ({ onClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Academic',
  });

  const [createSuggestion, { isLoading }] = useCreateSuggestionMutation();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      await createSuggestion(form).unwrap();
      toast.success('Suggestion submitted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit suggestion');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Submit Suggestion</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="Your suggestion title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe your suggestion in detail..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              <Lightbulb size={16} /> {isLoading ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SuggestionBox = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    return q;
  }, [search, statusFilter]);

  const { data, isLoading, refetch } = useGetSuggestionsQuery(queryArgs);
  const suggestions = data?.data || data?.suggestions || (Array.isArray(data) ? data : []);

  const [upvoteSuggestion] = useUpvoteSuggestionMutation();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = suggestions.filter(s => {
      const d = new Date(s.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return {
      total: suggestions.length,
      underReview: suggestions.filter(s => s.status === 'Under Review' || s.status === 'Under Consideration').length,
      implemented: suggestions.filter(s => s.status === 'Implemented').length,
      thisMonth,
    };
  }, [suggestions]);

  const statCards = [
    { label: 'Total Suggestions', value: stats.total, icon: Lightbulb, color: 'bg-amber-500' },
    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'bg-blue-500' },
    { label: 'Implemented', value: stats.implemented, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'This Month', value: stats.thisMonth, icon: Filter, color: 'bg-indigo-500' },
  ];

  const handleUpvote = async (suggestion) => {
    try {
      await upvoteSuggestion(suggestion._id).unwrap();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to upvote');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Lightbulb className="text-amber-600" size={28} />
            Suggestion Box
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Share and vote on improvement ideas for the school.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Clock size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> New Suggestion
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search suggestions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : suggestions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Lightbulb size={28} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No suggestions found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || statusFilter ? 'Try adjusting your filters.' : 'Click "New Suggestion" to submit one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Submitted By</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Votes</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suggestions.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-bold">{item.title}</div>
                      {item.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      {item.submittedBy || item.createdBy?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{item.category || '—'}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white">{item.votes ?? item.upvotes ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[item.status] || ''}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(item.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleUpvote(item)} title="Upvote"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:opacity-80 transition-opacity">
                          <ThumbsUp size={14} /> {item.votes ?? item.upvotes ?? 0}
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

      {showCreate && <SuggestionModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default SuggestionBox;
