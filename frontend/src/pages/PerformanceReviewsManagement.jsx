import { useState, useMemo } from 'react';
import {
  Star, Plus, Search, Edit3, X,
  AlertCircle, CheckCircle, Clock, RefreshCw,
  User, FileText, Award, TrendingUp,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from '../store/adminApiSlice';

const RATINGS = ['Excellent', 'Good', 'Average', 'Needs Improvement', 'Unsatisfactory'];
const STATUSES = ['Draft', 'In Progress', 'Completed', 'Archived'];

const STATUS_COLORS = {
  Draft:       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'In Progress':'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Archived:    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const RATING_COLORS = {
  Excellent:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Good:              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Average:           'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Needs Improvement':'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Unsatisfactory:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ReviewModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    employeeName: initial?.employeeName || '',
    employeeId: initial?.employeeId || '',
    department: initial?.department || '',
    period: initial?.period || '',
    reviewDate: initial?.reviewDate ? new Date(initial.reviewDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    overallScore: initial?.overallScore || '',
    rating: initial?.rating || '',
    status: initial?.status || 'Draft',
    strengths: initial?.strengths || '',
    improvements: initial?.improvements || '',
    goals: initial?.goals || '',
    comments: initial?.comments || '',
    criteria: initial?.criteria?.length > 0
      ? initial.criteria
      : [{ name: '', score: '', weight: '', comments: '' }],
  });
  const [createReview, { isLoading: creating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateCriterion = (index, key, value) => {
    setForm(p => {
      const criteria = [...p.criteria];
      criteria[index] = { ...criteria[index], [key]: value };
      return { ...p, criteria };
    });
  };

  const addCriterion = () => {
    setForm(p => ({
      ...p,
      criteria: [...p.criteria, { name: '', score: '', weight: '', comments: '' }],
    }));
  };

  const removeCriterion = (index) => {
    if (form.criteria.length <= 1) return;
    setForm(p => ({ ...p, criteria: p.criteria.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeName.trim()) return toast.error('Employee name is required');
    if (!form.period.trim()) return toast.error('Review period is required');
    try {
      const payload = {
        ...form,
        overallScore: Number(form.overallScore) || 0,
        criteria: form.criteria.map(c => ({
          ...c,
          score: Number(c.score) || 0,
          weight: Number(c.weight) || 0,
        })),
      };
      if (isEdit) {
        await updateReview({ id: initial._id, ...payload }).unwrap();
        toast.success('Review updated');
      } else {
        await createReview(payload).unwrap();
        toast.success('Review created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Review' : 'New Review'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Employee Name *</label>
              <input value={form.employeeName} onChange={e => set('employeeName', e.target.value)} required
                placeholder="e.g. John Smith"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Employee ID</label>
              <input value={form.employeeId} onChange={e => set('employeeId', e.target.value)}
                placeholder="e.g. TCH-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Department</label>
              <input value={form.department} onChange={e => set('department', e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Review Period *</label>
              <input value={form.period} onChange={e => set('period', e.target.value)} required
                placeholder="e.g. Q1 2026"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Review Date</label>
              <input type="date" value={form.reviewDate}
                onChange={e => set('reviewDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Overall Score (0-100)</label>
              <input type="number" min="0" max="100" value={form.overallScore}
                onChange={e => set('overallScore', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Rating</label>
              <select value={form.rating} onChange={e => set('rating', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">Select</option>
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold">Evaluation Criteria</label>
              <button type="button" onClick={addCriterion}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                <Plus size={14} /> Add Criterion
              </button>
            </div>
            <div className="space-y-2">
              {form.criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={c.name} onChange={e => updateCriterion(i, 'name', e.target.value)}
                    placeholder="Criterion name"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm" />
                  <input type="number" min="0" max="100" placeholder="Score"
                    value={c.score} onChange={e => updateCriterion(i, 'score', e.target.value)}
                    className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm" />
                  <input type="number" min="0" max="100" placeholder="Weight"
                    value={c.weight} onChange={e => updateCriterion(i, 'weight', e.target.value)}
                    className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm" />
                  <input value={c.comments} onChange={e => updateCriterion(i, 'comments', e.target.value)}
                    placeholder="Comments"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm" />
                  <button type="button" onClick={() => removeCriterion(i)} disabled={form.criteria.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors disabled:opacity-30">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Strengths</label>
              <textarea rows={2} value={form.strengths} onChange={e => set('strengths', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Areas for Improvement</label>
              <textarea rows={2} value={form.improvements} onChange={e => set('improvements', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Goals for Next Period</label>
            <textarea rows={2} value={form.goals} onChange={e => set('goals', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Additional Comments</label>
            <textarea rows={2} value={form.comments} onChange={e => set('comments', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PerformanceReviewsManagement = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', rating: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    if (filters.rating) q.rating = filters.rating;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetReviewsQuery(queryArgs);
  const reviews = data?.data || data?.reviews || [];

  const stats = useMemo(() => {
    const total = reviews.length;
    const completed = reviews.filter(r => r.status === 'Completed').length;
    const inProgress = reviews.filter(r => r.status === 'In Progress').length;
    const avgScore = reviews.length > 0
      ? Math.round(reviews.reduce((s, r) => s + (r.overallScore || 0), 0) / reviews.length)
      : 0;
    return { total, completed, inProgress, avgScore };
  }, [reviews]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Star className="text-indigo-600" size={28} />
            Performance Reviews
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track and manage employee performance evaluations.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Review
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Reviews" value={stats.total} icon={FileText} color="bg-indigo-500" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="bg-yellow-500" />
          <StatCard label="Avg Score" value={`${stats.avgScore}%`} icon={Award} color="bg-blue-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search reviews\u2026"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.rating} onChange={e => setF('rating', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Ratings</option>
            {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Star size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No reviews found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status || filters.rating
                ? 'Try adjusting your filters.'
                : 'Click "New Review" to create the first performance review.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Period</th>
                  <th className="px-5 py-3.5 text-right">Score</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map(review => (
                  <tr key={review._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{review.employeeName}</div>
                          {review.department && (
                            <div className="text-xs text-slate-400">{review.department}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {review.period}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(review.overallScore || 0) >= 70 ? 'bg-green-500' : (review.overallScore || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(review.overallScore || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white w-10 text-right">
                          {review.overallScore || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {review.rating ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${RATING_COLORS[review.rating] || ''}`}>
                          {review.rating}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">\u2014</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[review.status] || ''}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(review.reviewDate || review.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(review)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
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

      {showCreate && <ReviewModal onClose={() => setShowCreate(false)} />}
      {editRecord && <ReviewModal initial={editRecord} onClose={() => setEditRecord(null)} />}
    </div>
  );
};

export default PerformanceReviewsManagement;
