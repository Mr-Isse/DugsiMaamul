import { useState } from 'react';
import { 
  Megaphone, Plus, Edit3, Trash2, Users, GraduationCap, 
  BookOpen, AlertTriangle, Clock, CheckCircle, Search, Filter, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetAnnouncementsQuery, 
  useCreateAnnouncementMutation, 
  useUpdateAnnouncementMutation, 
  useDeleteAnnouncementMutation,
  useGetClassesQuery
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';
import ImageUpload from '../components/ImageUpload';

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const audienceIcons = {
  all: Users,
  students: GraduationCap,
  teachers: BookOpen,
  class: BookOpen,
};

const audienceLabels = {
  all: 'Everyone',
  students: 'Students',
  teachers: 'Teachers',
  class: 'Specific Class',
};

const AnnouncementsManagement = () => {
  const { showToast } = useToast();
  const { data: announcements = [], isLoading } = useGetAnnouncementsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAudience, setFilterAudience] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    title: '', content: '', audience: 'all', targetClass: '', priority: 'normal', media: null
  });

  const resetForm = () => {
    setForm({ title: '', content: '', audience: 'all', targetClass: '', priority: 'normal', media: null });
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title,
      content: item.content,
      audience: item.audience,
      targetClass: item.targetClass?._id || '',
      priority: item.priority,
      media: item.media || null,
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateAnnouncement({ id: editItem._id, ...form }).unwrap();
        showToast('Announcement updated successfully', 'success');
      } else {
        await createAnnouncement(form).unwrap();
        showToast('Announcement published successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAnnouncement(id).unwrap();
      showToast('Announcement deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = announcements.filter((a) => {
    const matchSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAudience = !filterAudience || a.audience === filterAudience;
    return matchSearch && matchAudience;
  });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <Megaphone className="text-primary" size={28} />
            Announcements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Send announcements to students, teachers, or the entire school
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Announcement
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
        </div>
        <select
          value={filterAudience}
          onChange={(e) => setFilterAudience(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
        >
          <option value="">All Audiences</option>
          <option value="all">Everyone</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
          <option value="class">Specific Class</option>
        </select>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editItem ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter announcement title"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your announcement message..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="all">Everyone</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="class">Specific Class</option>
                  </select>
                </div>
                {form.audience === 'class' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Class</label>
                    <select
                      value={form.targetClass}
                      onChange={(e) => setForm({ ...form, targetClass: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="">Choose class...</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attachment (Image/Document)</label>
                <ImageUpload 
                  value={form.media} 
                  onChange={(val) => setForm({ ...form, media: val })} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {isCreating || isUpdating ? 'Saving...' : editItem ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Megaphone className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Announcements</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first announcement to notify your school community.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const AudienceIcon = audienceIcons[a.audience] || Users;
            return (
              <motion.div
                key={a._id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{a.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColors[a.priority]}`}>
                        {a.priority}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2.5 py-0.5 rounded-full">
                        <AudienceIcon size={12} />
                        {audienceLabels[a.audience]}
                        {a.audience === 'class' && a.targetClass && ` — ${a.targetClass.name} ${a.targetClass.section}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">{a.content}</p>

                    {a.media && (
                      <div className="mt-4">
                        {a.media.resourceType === 'image' ? (
                          <img 
                            src={a.media.url} 
                            alt="Announcement" 
                            className="max-h-60 rounded-xl object-cover border border-gray-100 dark:border-gray-700" 
                          />
                        ) : (
                          <a 
                            href={a.media.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 text-sm text-primary hover:underline w-fit"
                          >
                            <CheckCircle size={18} />
                            View Attachment ({a.media.format?.toUpperCase()})
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatDate(a.createdAt)}
                      </span>
                      {a.createdBy && (
                        <span>by {a.createdBy.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <button onClick={() => openEdit(a)}
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(a._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === a._id && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                      <AlertTriangle size={16} />
                      Delete this announcement?
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button onClick={() => handleDelete(a._id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManagement;
