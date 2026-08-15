import React, { useState } from 'react';
import {
  useGetNotificationTemplatesQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useSeedNotificationTemplatesMutation
} from '../store/adminApiSlice';
import { Plus, Trash2, Edit2, FileText, RefreshCw } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { useAppToast } from '../hooks/useAppToast';

const NotificationTemplatesManagement = () => {
  const { toast } = useAppToast();
  const { data: templates, isLoading, refetch } = useGetNotificationTemplatesQuery();
  const [createTemplate] = useCreateNotificationTemplateMutation();
  const [updateTemplate] = useUpdateNotificationTemplateMutation();
  const [deleteTemplate] = useDeleteNotificationTemplateMutation();
  const [seedTemplates] = useSeedNotificationTemplatesMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'general',
    subject: '',
    body: '',
    placeholders: [],
    type: 'all',
    isActive: true
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTemplate(formData).unwrap();
      toast('Template created successfully', 'success');
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast(err.userMessage || 'Failed to create template', 'error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTemplate({ id: editingTemplate._id, ...formData }).unwrap();
      toast('Template updated successfully', 'success');
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast(err.userMessage || 'Failed to update template', 'error');
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    try {
      await deleteTemplate(template._id).unwrap();
      toast('Template deleted successfully', 'success');
    } catch (err) {
      toast(err.userMessage || 'Failed to delete template', 'error');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Are you sure you want to seed default templates?')) return;
    try {
      await seedTemplates().unwrap();
      toast('Templates seeded successfully', 'success');
    } catch (err) {
      toast(err.userMessage || 'Failed to seed templates', 'error');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      code: template.code,
      category: template.category,
      subject: template.subject,
      body: template.body,
      placeholders: template.placeholders || [],
      type: template.type,
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      code: '',
      category: 'general',
      subject: '',
      body: '',
      placeholders: [],
      type: 'all',
      isActive: true
    });
  };

  const categoryColors = {
    general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    finance: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    attendance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    academic: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    admission: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    events: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight">
            Notification Templates
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage templates for school notifications
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw size={18} />
            Seed Default Templates
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={18} />
            Create Template
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(templates || []).map((template) => (
            <div key={template._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <FileText className="text-slate-600 dark:text-slate-300" size={24} />
                </div>
                <div className="flex gap-2">
                  {!template.isSystem && (
                    <>
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{template.name}</h3>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[template.category] || categoryColors.general}`}>
                  {template.category}
                </span>
                {template.isSystem && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                    System
                  </span>
                )}
                {!template.isActive && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Inactive
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Subject: {template.subject}</p>

              <p className="text-xs text-slate-400 line-clamp-3">{template.body}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <form onSubmit={editingTemplate ? handleUpdateSubmit : handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="finance">Finance</option>
                  <option value="attendance">Attendance</option>
                  <option value="academic">Academic</option>
                  <option value="admission">Admission</option>
                  <option value="events">Events</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Body
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Placeholders (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.placeholders.join(', ')}
                  onChange={(e) => setFormData({ ...formData, placeholders: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="studentName, parentName, amount"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplatesManagement;
