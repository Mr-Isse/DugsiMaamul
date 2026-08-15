import { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2, X,
  Calendar, AlertCircle, RefreshCw, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetHomeworksQuery,
  useCreateHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,
  useGetClassesQuery,
  useGetSubjectsQuery,
} from '../store/adminApiSlice';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const HomeworkModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title:       initial?.title || '',
    description: initial?.description || '',
    class:       initial?.class?._id || initial?.class || '',
    subject:     initial?.subject?._id || initial?.subject || '',
    dueDate:     initial?.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '',
    totalMarks:  initial?.totalMarks || '',
  });

  const { data: classesData } = useGetClassesQuery();
  const { data: subjectsData } = useGetSubjectsQuery();
  const classes = classesData?.data || classesData?.classes || (Array.isArray(classesData) ? classesData : []);
  const subjects = subjectsData?.data || subjectsData?.subjects || (Array.isArray(subjectsData) ? subjectsData : []);

  const [createHomework, { isLoading: creating }] = useCreateHomeworkMutation();
  const [updateHomework, { isLoading: updating }] = useUpdateHomeworkMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.class) return toast.error('Class is required');
    if (!form.subject) return toast.error('Subject is required');
    if (!form.dueDate) return toast.error('Due date is required');
    try {
      const payload = { ...form, totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined };
      if (isEdit) {
        await updateHomework({ id: initial._id, ...payload }).unwrap();
        toast.success('Homework updated');
      } else {
        await createHomework(payload).unwrap();
        toast.success('Homework created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save homework');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Homework' : 'New Homework'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="e.g. Chapter 5 Exercises"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Instructions for students..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Class *</label>
              <select value={form.class} onChange={e => set('class', e.target.value)} required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">Select class</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Subject *</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)} required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Due Date *</label>
              <input type="date" required value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Total Marks</label>
              <input type="number" min="0" value={form.totalMarks}
                onChange={e => set('totalMarks', e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving...' : 'Save Homework'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ homework, onClose }) => {
  const [deleteHomework, { isLoading }] = useDeleteHomeworkMutation();

  const handleDelete = async () => {
    try {
      await deleteHomework(homework._id).unwrap();
      toast.success('Homework deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete homework');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Homework</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{homework.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HomeworkManagement = () => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const { data: classesData } = useGetClassesQuery();
  const { data: subjectsData } = useGetSubjectsQuery();
  const classes = classesData?.data || classesData?.classes || (Array.isArray(classesData) ? classesData : []);
  const subjects = subjectsData?.data || subjectsData?.subjects || (Array.isArray(subjectsData) ? subjectsData : []);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (classFilter) q.class = classFilter;
    if (subjectFilter) q.subject = subjectFilter;
    return q;
  }, [search, classFilter, subjectFilter]);

  const { data, isLoading, refetch } = useGetHomeworksQuery(queryArgs);
  const homeworks = data?.data || data?.homeworks || (Array.isArray(data) ? data : []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-blue-600" size={28} />
            Homework
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage assignments and homework for classes.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Homework
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search homework..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : homeworks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <FileText size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No homework found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || classFilter || subjectFilter
                ? 'Try adjusting your filters.'
                : 'Click "Add Homework" to create your first assignment.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Class</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Marks</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {homeworks.map(hw => (
                  <tr key={hw._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{hw.title}</div>
                      {hw.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{hw.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {hw.class?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {hw.subject?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {fmtDate(hw.dueDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white">
                      {hw.totalMarks ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(hw)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(hw)} title="Delete"
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

      {showCreate   && <HomeworkModal onClose={() => setShowCreate(false)} />}
      {editRecord   && <HomeworkModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal homework={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default HomeworkManagement;
