import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Edit3, X, CheckCircle, XCircle,
  Upload, Download, Clock,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useAddDocumentVersionMutation,
  useGetDocumentStatsQuery,
} from '../store/adminApiSlice';

const DOC_TYPES = ['Policy', 'Contract', 'Certificate', 'Report', 'Manual', 'Other'];

const STATUS_COLORS = {
  Draft:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Pending:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Archived: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
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

const DocumentModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    title: initial?.title || '',
    type: initial?.type || 'Policy',
    status: initial?.status || 'Draft',
    description: initial?.description || '',
  });
  const [createDocument] = useCreateDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Document title is required');
    try {
      if (isEdit) {
        await updateDocument({ id: initial._id, ...form }).unwrap();
        toast.success('Document updated');
      } else {
        await createDocument(form).unwrap();
        toast.success('Document created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save document');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Document' : 'New Document'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="e.g. Code of Conduct Policy"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isEdit ? 'Update Document' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VersionHistory = ({ documentId, versions }) => {
  if (!versions || versions.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Version History</p>
      <div className="space-y-1.5">
        {versions.map((v, i) => (
          <div key={v._id || i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
            <Clock size={12} className="text-slate-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">v{v.version || `${versions.length - i}`}</span>
            <span className="text-slate-500 dark:text-slate-400">{v.note || 'Updated'}</span>
            <span className="ml-auto text-slate-400">{fmtDate(v.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentManagement = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    if (filters.type) q.type = filters.type;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetDocumentsQuery(queryArgs);
  const { data: statsData } = useGetDocumentStatsQuery();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [approveDocument] = useApproveDocumentMutation();
  const [rejectDocument] = useRejectDocumentMutation();

  const documents = data?.data || data?.documents || [];
  const docStats = statsData?.data || {};

  const stats = useMemo(() => {
    if (docStats.total !== undefined) {
      return {
        total: docStats.total || 0,
        pending: docStats.pending || 0,
        approved: docStats.approved || 0,
        draft: docStats.draft || 0,
      };
    }
    const total = documents.length;
    const pending = documents.filter(d => d.status === 'Pending').length;
    const approved = documents.filter(d => d.status === 'Approved').length;
    const draft = documents.filter(d => d.status === 'Draft').length;
    return { total, pending, approved, draft };
  }, [documents, docStats]);

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id).unwrap();
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete document');
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveDocument(id).unwrap();
      toast.success('Document approved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve document');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDocument(id).unwrap();
      toast.success('Document rejected');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject document');
    }
  };

  const openEdit = (item) => { setEditItem(item); setShowModal(true); };
  const openCreate = () => { setEditItem(null); setShowModal(true); };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="text-indigo-600" size={28} />
            Document Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage policies, contracts, certificates, and institutional documents.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Download size={16} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Document
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Documents" value={stats.total} icon={FileText} color="bg-indigo-500" />
          <StatCard label="Pending Approval" value={stats.pending} icon={Clock} color="bg-yellow-500" />
          <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Draft" value={stats.draft} icon={Edit3} color="bg-blue-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search documents\u2026"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.type} onChange={e => setF('type', e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Types</option>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : documents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <FileText size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No documents found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status || filters.type
                ? 'Try adjusting your filters.'
                : 'Click "New Document" to upload your first document.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map(doc => (
                  <tr key={doc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{doc.title}</div>
                      {doc.description && (
                        <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{doc.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{doc.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[doc.status] || ''}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      v{doc.version || '1.0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {doc.author || '\u2014'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {fmtDate(doc.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setExpandedId(expandedId === doc._id ? null : doc._id)}
                          title="Version History"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <Clock size={14} />
                        </button>
                        {doc.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApprove(doc._id)} title="Approve"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={() => handleReject(doc._id)} title="Reject"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button onClick={() => openEdit(doc)} title="Edit"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(doc._id)} title="Delete"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <X size={14} />
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

      {expandedId && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Version History</h2>
          <VersionHistory documentId={expandedId}
            versions={documents.find(d => d._id === expandedId)?.versions || []} />
        </div>
      )}

      {showModal && <DocumentModal initial={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
    </div>
  );
};

export default DocumentManagement;
