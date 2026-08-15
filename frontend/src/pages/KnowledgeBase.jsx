import { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Edit3, X, Eye, Tag, FileText, Trash2, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetKnowledgeBaseQuery,
  useCreateKnowledgeBaseArticleMutation,
  useUpdateKnowledgeBaseArticleMutation,
  useDeleteKnowledgeBaseArticleMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Draft', 'Published', 'Archived'];
const CATEGORIES = ['How-To', 'Policy', 'FAQ', 'Guide', 'Template'];

const STATUS_COLORS = {
  Draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ArticleModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    content: initial?.content || '',
    category: initial?.category || 'How-To',
    tags: initial?.tags?.join(', ') || '',
    status: initial?.status || 'Draft',
  });

  const [createArticle, { isLoading: creating }] = useCreateKnowledgeBaseArticleMutation();
  const [updateArticle, { isLoading: updating }] = useUpdateKnowledgeBaseArticleMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateArticle({ id: initial._id, ...payload }).unwrap();
        toast.success('Article updated');
      } else {
        await createArticle(payload).unwrap();
        toast.success('Article created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save article');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Article' : 'New Article'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="Article title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Content *</label>
            <textarea rows={8} value={form.content} onChange={e => set('content', e.target.value)} required
              placeholder="Write your article content here..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="e.g. onboarding, rules, schedule"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              <BookOpen size={16} /> {creating || updating ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ article, onClose }) => {
  const [deleteArticle, { isLoading }] = useDeleteKnowledgeBaseArticleMutation();

  const handleDelete = async () => {
    try {
      await deleteArticle(article._id).unwrap();
      toast.success('Article deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete article');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Article</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete "<span className="font-bold text-slate-700 dark:text-slate-200">{article.title}</span>"?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors text-sm">
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const KnowledgeBase = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (categoryFilter) q.category = categoryFilter;
    if (statusFilter) q.status = statusFilter;
    return q;
  }, [search, categoryFilter, statusFilter]);

  const { data, isLoading, refetch } = useGetKnowledgeBaseQuery(queryArgs);
  const articles = data?.data || data?.articles || (Array.isArray(data) ? data : []);

  const stats = useMemo(() => {
    const cats = new Set(articles.map(a => a.category).filter(Boolean));
    return {
      total: articles.length,
      published: articles.filter(a => a.status === 'Published').length,
      draft: articles.filter(a => a.status === 'Draft').length,
      categories: cats.size,
    };
  }, [articles]);

  const statCards = [
    { label: 'Total Articles', value: stats.total, icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Published', value: stats.published, icon: Eye, color: 'bg-green-500' },
    { label: 'Draft', value: stats.draft, icon: FileText, color: 'bg-yellow-500' },
    { label: 'Categories', value: stats.categories, icon: Tag, color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-blue-600" size={28} />
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Create and manage articles, guides, and documentation.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Eye size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> New Article
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
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
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
        ) : articles.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No articles found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || categoryFilter || statusFilter ? 'Try adjusting your filters.' : 'Click "New Article" to create your first one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Views</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {articles.map(article => (
                  <tr key={article._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-bold">{article.title}</div>
                      {article.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {article.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{article.category || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{article.author || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap font-bold">{article.views ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(article.updatedAt || article.createdAt)}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[article.status] || ''}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(article)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(article)} title="Delete"
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

      {showCreate && <ArticleModal onClose={() => setShowCreate(false)} />}
      {editRecord && <ArticleModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal article={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default KnowledgeBase;
