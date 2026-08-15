import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Check,
  Code,
  AlertCircle,
  Loader2,
  Trash2,
  Search,
} from 'lucide-react';
import { 
  useGetSubjectsQuery, 
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useLazyCheckSubjectCodeQuery,
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { PageLayout, PageHeader, ContentCard } from '../components/PageLayout';
import { DataTable, SearchInput } from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import {
  lettersAndSpacesOnly,
  subjectCodeStrict,
  normalizeName,
  filterLettersAndSpaces,
  filterSubjectCode,
} from '../utils/strictValidation';

const SubjectsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(null);
  const { selectedBranch } = useSelector((state) => state.branch);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [showErrors, setShowErrors] = useState(false);

  const { data: subjects, isLoading } = useGetSubjectsQuery();
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const [checkSubjectCode] = useLazyCheckSubjectCodeQuery();


  const checkCodeAvailability = useCallback(async (code) => {
    const normalizedCode = code.toUpperCase().trim();
    if (!normalizedCode || !/^[A-Z0-9]+$/.test(normalizedCode)) {
      setCodeAvailable(null);
      return;
    }
    setCodeChecking(true);
    try {
      const result = await checkSubjectCode({ 
        code: normalizedCode,
        excludeId: selectedSubject?._id 
      }).unwrap();
      setCodeAvailable(result.available);
    } catch (error) {
      setCodeAvailable(null);
    }
    setCodeChecking(false);
  }, [checkSubjectCode, selectedSubject?._id]);

  useEffect(() => {
    const normalizedCode = formData.code.toUpperCase().trim();
    if (!normalizedCode) {
      setCodeAvailable(null);
      return;
    }
    if (selectedSubject && normalizedCode === selectedSubject.code.toUpperCase()) {
      setCodeAvailable(true);
      return;
    }
    if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
      setCodeAvailable(null);
      return;
    }
    const timeoutId = setTimeout(() => {
      checkCodeAvailability(formData.code);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.code, selectedSubject, checkCodeAvailability]);

  const fieldErrors = useMemo(() => {
    const name = lettersAndSpacesOnly('Subject Name', formData.name);
    const code = subjectCodeStrict('Subject Code', formData.code);
    const codeDuplicate = codeAvailable === false ? 'This subject code already exists.' : null;
    return { name, code, codeDuplicate };
  }, [formData, codeAvailable]);

  const formValid = !Object.values(fieldErrors).some(Boolean) && codeAvailable !== false;

  const handleOpenModal = (sub = null) => {
    setShowErrors(false);
    if (sub) {
      setSelectedSubject(sub);
      setFormData({ name: sub.name, code: sub.code });
      setCodeAvailable(true);
    } else {
      setSelectedSubject(null);
      setFormData({ name: '', code: '' });
      setCodeAvailable(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    if (!formValid) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      const name = normalizeName(formData.name);
      const code = filterSubjectCode(formData.code);
      if (selectedSubject) {
        await updateSubject({ id: selectedSubject._id, name, code }).unwrap();
        toast.success('Subject updated successfully');
      } else {
        await createSubject({ name, code }).unwrap();
        toast.success('Subject created successfully');
      }
      setIsModalOpen(false);
      setShowErrors(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.message || 'Something went wrong. Please try again.');
    }
  };

  const shouldShowError = (field, value) => {
    if (field === 'code' && (fieldErrors.code || fieldErrors.codeDuplicate)) {
      return showErrors || (value && String(value).length > 0);
    }
    return fieldErrors[field] && (showErrors || (value && String(value).length > 0));
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    try {
      await deleteSubject(subjectToDelete._id).unwrap();
      toast.success('Subject deleted successfully');
      setSubjectToDelete(null);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.message || 'Something went wrong. Please try again.');
    }
  };

  const confirmDeleteSubject = (subject) => {
    setSubjectToDelete(subject);
    setIsDeleteModalOpen(true);
  };

  const filteredSubjects = subjects?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Code',
      key: 'code',
      render: (sub) => (
        <Badge variant="outline" className="font-mono text-[10px] font-bold">
          {sub.code}
        </Badge>
      ),
    },
    {
      header: 'Subject Name',
      key: 'name',
      render: (sub) => (
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.name}</span>
        </div>
      ),
    },
    ...(!selectedBranch ? [{
      header: 'Branch',
      key: 'branch',
      render: (sub) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{sub.branch?.name || 'Main Branch'}</span>
      ),
    }] : []),
    {
      header: '',
      key: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (sub) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(sub)} className="h-8 w-8 text-indigo-600">
            <Edit2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => confirmDeleteSubject(sub)} className="h-8 w-8 text-rose-500">
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Subjects Management"
        description="School-wide subject catalog. Manage global subjects here."
        icon={BookOpen}
        actions={
          <Button onClick={() => handleOpenModal()} className="rounded-xl gap-2">
            <Plus size={16} />
            Add Subject
          </Button>
        }
      />

      <ContentCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or code..."
            className="flex-1 max-w-md"
          />
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filteredSubjects}
            isLoading={isLoading}
            emptyTitle="No subjects found"
            emptyDescription="Try adjusting your search or add a new subject."
            emptyAction={
              <Button onClick={() => handleOpenModal()} variant="outline" size="sm">
                <Plus size={14} className="mr-1" /> Add Subject
              </Button>
            }
          />
        </div>
      </ContentCard>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white dark:bg-slate-950 rounded-2xl p-6 sm:p-10 w-full max-w-lg shadow-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {selectedSubject ? 'Edit Subject' : 'Add New Subject'}
                </h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <span className="sr-only">Close</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className={`text-xs font-bold ml-1 transition-colors ${shouldShowError('name', formData.name) ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: filterLettersAndSpaces(e.target.value) })}
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 transition-all duration-200 outline-none text-sm ${
                        shouldShowError('name', formData.name) 
                          ? 'border-red-500 ring-4 ring-red-500/10' 
                          : 'border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className={`text-xs font-bold ml-1 transition-colors ${shouldShowError('code', formData.code) ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: filterSubjectCode(e.target.value) })}
                        className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 transition-all duration-200 outline-none uppercase text-sm ${
                          shouldShowError('code', formData.code)
                            ? 'border-red-500 ring-4 ring-red-500/10' 
                            : codeAvailable === true && formData.code
                            ? 'border-emerald-500 ring-4 ring-emerald-500/10'
                            : 'border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        }`}
                        placeholder="e.g. MATH101"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {codeChecking && <Loader2 size={18} className="animate-spin text-slate-400" />}
                        {!codeChecking && codeAvailable === true && formData.code && !fieldErrors.code && <Check size={18} className="text-emerald-500" />}
                        {!codeChecking && codeAvailable === false && <AlertCircle size={18} className="text-red-500" />}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isCreating || isUpdating || !formValid}
                  className="w-full py-3 sm:py-4 mt-2 sm:mt-4 rounded-xl font-bold"
                >
                  {isCreating || isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <><Check size={18} className="mr-1" /> {selectedSubject ? 'Update Subject' : 'Create Subject'}</>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete ${subjectToDelete?.name}? This also removes it from all classes and schedules.`}
        confirmText="Delete Subject"
      />
    </PageLayout>
  );
};

export default SubjectsManagement;
