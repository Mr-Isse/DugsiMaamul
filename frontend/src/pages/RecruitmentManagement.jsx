import { useState, useMemo } from 'react';
import {
  Briefcase, Plus, Search, Edit3, Trash2, X,
  AlertCircle, CheckCircle, Clock, RefreshCw,
  Users, MapPin, DollarSign, Calendar, Award,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetJobPostingsQuery,
  useCreateJobPostingMutation,
  useUpdateJobPostingMutation,
  useDeleteJobPostingMutation,
} from '../store/adminApiSlice';

const DEPARTMENTS = [
  'Administration', 'Teaching', 'Science', 'Mathematics', 'English',
  'Humanities', 'Sports', 'IT', 'Finance', 'HR', 'Marketing', 'Other',
];
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const STATUSES = ['Draft', 'Open', 'Closed', 'Filled'];

const STATUS_COLORS = {
  Draft:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Open:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Filled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const JOB_TYPE_COLORS = {
  'Full-time':  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Part-time':  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Contract':   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Internship': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Temporary':  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

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

const JobPostingModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    title: initial?.title || '',
    department: initial?.department || 'Teaching',
    jobType: initial?.jobType || 'Full-time',
    openings: initial?.openings || '1',
    description: initial?.description || '',
    requirements: initial?.requirements || '',
    salaryMin: initial?.salaryMin || '',
    salaryMax: initial?.salaryMax || '',
    location: initial?.location || '',
    closingDate: initial?.closingDate ? new Date(initial.closingDate).toISOString().split('T')[0] : '',
    status: initial?.status || 'Draft',
  });
  const [createJobPosting, { isLoading: creating }] = useCreateJobPostingMutation();
  const [updateJobPosting, { isLoading: updating }] = useUpdateJobPostingMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Job title is required');
    if (!form.description.trim()) return toast.error('Description is required');
    try {
      const payload = {
        ...form,
        openings: Number(form.openings) || 1,
        salaryMin: Number(form.salaryMin) || undefined,
        salaryMax: Number(form.salaryMax) || undefined,
      };
      if (isEdit) {
        await updateJobPosting({ id: initial._id, ...payload }).unwrap();
        toast.success('Job posting updated');
      } else {
        await createJobPosting(payload).unwrap();
        toast.success('Job posting created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save job posting');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Job Posting' : 'New Job Posting'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Job Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="e.g. Senior Mathematics Teacher"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Department *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Job Type</label>
              <select value={form.jobType} onChange={e => set('jobType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Openings</label>
              <input type="number" min="1" value={form.openings}
                onChange={e => set('openings', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                placeholder="e.g. Main Campus"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Salary Range (Min)</label>
              <input type="number" min="0" value={form.salaryMin}
                onChange={e => set('salaryMin', e.target.value)}
                placeholder="e.g. 30000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Salary Range (Max)</label>
              <input type="number" min="0" value={form.salaryMax}
                onChange={e => set('salaryMax', e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Closing Date</label>
              <input type="date" value={form.closingDate}
                onChange={e => set('closingDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
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
            <label className="block text-sm font-bold mb-1">Description *</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} required
              placeholder="Describe the role, responsibilities, and expectations..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Requirements</label>
            <textarea rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)}
              placeholder="List qualifications, skills, and experience needed..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Job Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteJobPostingModal = ({ job, onClose }) => {
  const toast = useToast();
  const [deleteJobPosting, { isLoading }] = useDeleteJobPostingMutation();

  const handleDelete = async () => {
    try {
      await deleteJobPosting(job._id).unwrap();
      toast.success('Job posting deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete job posting');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Job Posting</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">&quot;{job.title}&quot;</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting\u2026' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RecruitmentManagement = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', department: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    if (filters.department) q.department = filters.department;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetJobPostingsQuery(queryArgs);
  const postings = data?.data || data?.postings || [];

  const stats = useMemo(() => {
    const total = postings.length;
    const open = postings.filter(p => p.status === 'Open').length;
    const totalOpenings = postings.reduce((s, p) => s + (p.openings || 0), 0);
    const filled = postings.filter(p => p.status === 'Filled').length;
    return { total, open, totalOpenings, filled };
  }, [postings]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Briefcase className="text-indigo-600" size={28} />
            Recruitment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage job postings and track open positions.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Posting
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Postings" value={stats.total} icon={Briefcase} color="bg-indigo-500" />
          <StatCard label="Open Positions" value={stats.open} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Total Openings" value={stats.totalOpenings} icon={Users} color="bg-blue-500" />
          <StatCard label="Filled" value={stats.filled} icon={Award} color="bg-purple-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search job postings\u2026"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.department} onChange={e => setF('department', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : postings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No job postings found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status || filters.department
                ? 'Try adjusting your filters.'
                : 'Click "New Posting" to create your first job posting.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-right">Openings</th>
                  <th className="px-5 py-3.5">Salary Range</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {postings.map(job => (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{job.title}</div>
                      {job.location && (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={12} /> {job.location}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{job.department}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${JOB_TYPE_COLORS[job.jobType] || ''}`}>
                        {job.jobType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                      {job.openings}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {job.salaryMin || job.salaryMax ? (
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {fmt(job.salaryMin)} - {fmt(job.salaryMax)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not specified</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[job.status] || ''}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(job)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(job)} title="Delete"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
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

      {showCreate && <JobPostingModal onClose={() => setShowCreate(false)} />}
      {editRecord && <JobPostingModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteJobPostingModal job={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default RecruitmentManagement;
