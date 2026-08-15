import React, { useState } from 'react';
import {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} from '../store/adminApiSlice';
import { Plus, Trash2, Edit2, Eye, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { useAppToast } from '../hooks/useAppToast';
import ImageUpload from '../components/ImageUpload';

const DocumentsManagement = () => {
  const { toast } = useAppToast();
  const { data: documentsData, isLoading, refetch } = useGetDocumentsQuery();
  const [createDocument] = useCreateDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [deleteDocument] = useDeleteDocumentMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Other',
    user: null,
    file: null,
    expiryDate: '',
    status: 'Active',
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDocument(formData).unwrap();
      toast('Document created successfully', 'success');
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast(err.userMessage || 'Failed to create document', 'error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDocument({ id: editingDoc._id, ...formData }).unwrap();
      toast('Document updated successfully', 'success');
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast(err.userMessage || 'Failed to update document', 'error');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    try {
      await deleteDocument(doc._id).unwrap();
      toast('Document deleted successfully', 'success');
    } catch (err) {
      toast(err.userMessage || 'Failed to delete document', 'error');
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      type: doc.type,
      user: doc.user,
      file: doc.file,
      expiryDate: doc.expiryDate || '',
      status: doc.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      type: 'Other',
      user: null,
      file: null,
      expiryDate: '',
      status: 'Active',
    });
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'Image':
        return <ImageIcon className="text-purple-500" />;
      case 'Video':
        return <Video className="text-green-500" />;
      case 'Document':
      default:
        return <FileText className="text-blue-500" />;
    }
  };

  const documents = documentsData?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight">Document Management</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Upload and manage the school’s shared files</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                {doc.file?.url ? (
                  doc.file.mimetype?.startsWith('image/') ? (
                    <img
                      src={doc.file.url}
                      alt={doc.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      {getIconForType(doc.type)}
                    </div>
                  )
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <FileText className="text-slate-400" size={32} />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{doc.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Type: {doc.type}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Status: {doc.status}
              </p>
              {doc.expiryDate && (
                <p className="text-xs text-slate-400">
                  Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                </p>
              )}
              {doc.file?.url && (
                <a
                  href={doc.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  <Eye size={14} />
                  View Document
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingDoc ? 'Edit Document' : 'Upload Document'}
            </h2>
            <form onSubmit={editingDoc ? handleUpdateSubmit : handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <option value="Other">Other</option>
                  <option value="Document">Document</option>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  File
                </label>
                {!editingDoc ? (
                  <ImageUpload
                    onFileUpload={(file) => setFormData({ ...formData, file })}
                    existingFile={formData.file}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.file?.url || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file: { ...formData.file, url: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
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
                  {editingDoc ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsManagement;
