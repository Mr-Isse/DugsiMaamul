import React, { useState } from 'react';
import { 
  useGetAcademicTermsQuery, 
  useCreateAcademicTermMutation, 
  useUpdateAcademicTermMutation,
  useDeleteAcademicTermMutation,
  useActivateAcademicTermMutation,
  useArchiveAcademicTermMutation,
  useGetAcademicYearsQuery
} from '../store/adminApiSlice';
import { Calendar, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

const AcademicTermsManagement = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const { data: yearsData } = useGetAcademicYearsQuery();
  const { data, isLoading, isError, error, refetch } = useGetAcademicTermsQuery(
    selectedYear ? { academicYearId: selectedYear } : undefined
  );
  const [createTerm, { isLoading: isCreating }] = useCreateAcademicTermMutation();
  const [updateTerm, { isLoading: isUpdating }] = useUpdateAcademicTermMutation();
  const [deleteTerm, { isLoading: isDeleting }] = useDeleteAcademicTermMutation();
  const [activateTerm] = useActivateAcademicTermMutation();
  const [archiveTerm] = useArchiveAcademicTermMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    academicYear: '',
    startDate: '',
    endDate: '',
    order: 1,
    status: 'upcoming'
  });

  const years = yearsData?.data || [];
  const terms = data?.data || [];

  const validateForm = () => {
    const errors = {};
    const name = formData.name.trim();
    const code = formData.code.trim();
    const start = formData.startDate ? new Date(formData.startDate) : null;
    const end = formData.endDate ? new Date(formData.endDate) : null;
    const selectedAcademicYear = years.find((year) => year._id === formData.academicYear);

    if (name.length < 2) errors.name = 'Enter a term name with at least 2 characters.';
    if (code.length > 20) errors.code = 'Term code cannot exceed 20 characters.';
    if (!formData.academicYear) errors.academicYear = 'Select an academic year.';
    if (!formData.startDate) errors.startDate = 'Select a start date.';
    if (!formData.endDate) errors.endDate = 'Select an end date.';
    if (start && end && end < start) errors.endDate = 'End date must be on or after start date.';
    if (selectedAcademicYear && start && end) {
      const yearStart = new Date(selectedAcademicYear.startDate);
      const yearEnd = new Date(selectedAcademicYear.endDate);
      if (start < yearStart || end > yearEnd) {
        errors.endDate = 'Term dates must stay inside the selected academic year.';
      }
    }
    if (!Number.isInteger(Number(formData.order)) || Number(formData.order) < 1) {
      errors.order = 'Order must be a whole number greater than 0.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (term = null) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        name: term.name,
        code: term.code || '',
        academicYear: term.academicYear?._id || term.academicYear,
        startDate: term.startDate.split('T')[0],
        endDate: term.endDate.split('T')[0],
        order: term.order || 1,
        status: term.status
      });
    } else {
      setEditingTerm(null);
      setFormData({
        name: '',
        code: '',
        academicYear: selectedYear,
        startDate: '',
        endDate: '',
        order: terms.length + 1,
        status: 'upcoming'
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      code: formData.code.trim(),
      order: Number(formData.order),
    };

    try {
      if (editingTerm) {
        await updateTerm({ id: editingTerm._id, ...payload }).unwrap();
        toast.success('Academic term updated');
      } else {
        await createTerm(payload).unwrap();
        toast.success('Academic term created');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong');
    }
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleDelete = async (termId) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await deleteTerm(termId).unwrap();
        toast.success('Academic term deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete term');
      }
    }
  };

  const handleQuickAction = async (term, action) => {
    try {
      if (action === 'activate') {
        await activateTerm(term._id).unwrap();
        toast.success('Academic term activated');
      } else if (action === 'archive') {
        await archiveTerm(term._id).unwrap();
        toast.success('Academic term archived');
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-purple-100 text-purple-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <TableSkeleton rows={6} columns={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Terms</h1>
          <p className="text-sm text-gray-500">Manage academic terms (semesters, quarters, etc.) for each academic year.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} /> Add Term
        </button>
      </div>

      {/* Academic Year Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Select Academic Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year._id} value={year._id}>{year.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isError ? (
          <div className="p-8 flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Unable to load academic terms</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error?.data?.userMessage || error?.data?.message || 'Please refresh and try again.'}
              </p>
            </div>
          </div>
        ) : terms.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No academic terms found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create the first term for the selected academic year.
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Term Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Code</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Academic Year</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Order</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {terms.map((term) => (
              <tr key={term._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{term.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{term.code || '-'}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                  {typeof term.academicYear === 'object' ? term.academicYear.name : '-'}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{term.order}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(term.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(term.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(term.status)}`}>
                    {term.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {term.status !== 'active' && term.status !== 'archived' && (
                    <button onClick={() => handleQuickAction(term, 'activate')} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-xs font-bold transition-colors">
                      Activate
                    </button>
                  )}
                  {term.status !== 'archived' && (
                    <button onClick={() => handleQuickAction(term, 'archive')} className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors">
                      Archive
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(term)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(term._id)} 
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6">{editingTerm ? 'Edit Term' : 'New Term'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Term Name (e.g. First Semester)</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                />
                {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Term Code (optional, e.g. SEM1)</label>
                <input 
                  value={formData.code}
                  onChange={e => updateField('code', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                />
                {formErrors.code && <p className="text-xs text-red-600 mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Academic Year</label>
                <select 
                  required
                  value={formData.academicYear}
                  onChange={e => updateField('academicYear', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                >
                  <option value="">Select Academic Year</option>
                  {years.map((year) => (
                    <option key={year._id} value={year._id}>{year.name}</option>
                  ))}
                </select>
                {formErrors.academicYear && <p className="text-xs text-red-600 mt-1">{formErrors.academicYear}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => updateField('startDate', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                  />
                  {formErrors.startDate && <p className="text-xs text-red-600 mt-1">{formErrors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">End Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => updateField('endDate', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                  />
                  {formErrors.endDate && <p className="text-xs text-red-600 mt-1">{formErrors.endDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Order</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={formData.order}
                  onChange={e => updateField('order', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 outline-none focus:border-indigo-500"
                />
                {formErrors.order && <p className="text-xs text-red-600 mt-1">{formErrors.order}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={e => updateField('status', e.target.checked ? 'active' : 'upcoming')}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-sm font-bold">Set as Current Active Term</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={isCreating || isUpdating} className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {isCreating || isUpdating ? 'Saving...' : 'Save Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicTermsManagement;
