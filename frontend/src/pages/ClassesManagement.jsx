import React, { useMemo, useState } from 'react';
import { 
  Plus, 
  Check,
  Users,
  Layers,
  Globe,
} from 'lucide-react';
import { 
  useGetClassesQuery, 
  useCreateClassMutation,
} from '../store/adminApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../components/ui/button';
import { PageLayout, PageHeader, ContentCard, SectionHeader } from '../components/PageLayout';
import { SearchInput, FilterBar } from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import {
  alphanumericWithSpaces,
  classSectionABCD,
  digitsOnlyUnsignedInt,
  normalizeName,
  filterAlphanumericWithSpaces,
} from '../utils/strictValidation';
import { useAppToast } from '../hooks/useAppToast';

const ClassesManagement = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useAppToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedBranch } = useSelector((state) => state.branch);
  
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    maxStudents: '',
  });
  const [showErrors, setShowErrors] = useState(false);

  const { data: classes, isLoading } = useGetClassesQuery();
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();

  const filteredClasses = useMemo(() => {
    const list = classes || [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(c => 
      String(c.name || '').toLowerCase().includes(q) || 
      String(c.section || '').toLowerCase().includes(q)
    );
  }, [classes, searchTerm]);

  const resetForm = () => {
    setFormData({ className: '', section: '', maxStudents: '' });
    setShowErrors(false);
  };

  const fieldErrors = useMemo(() => {
    const className = alphanumericWithSpaces('Class Name', formData.className);
    const section = classSectionABCD('Section', formData.section);
    const maxStudents = digitsOnlyUnsignedInt('Maximum Students', formData.maxStudents, {
      required: true,
      min: 1,
      max: 99999,
    });
    return { className, section, maxStudents };
  }, [formData]);

  const formValid = !Object.values(fieldErrors).some(Boolean);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    try {
      if (!formValid) {
        showError('Please fix the errors in the form');
        return;
      }
      await createClass({
        className: normalizeName(formData.className),
        section: formData.section.trim().toUpperCase(),
        maxStudents: Number(formData.maxStudents),
      }).unwrap();
      showSuccess('Class created successfully');
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      showError(err);
    }
  };

  const shouldShowError = (field, value) => {
    return fieldErrors[field] && (showErrors || (value && value.length > 0));
  };

  return (
    <PageLayout>
      <PageHeader
        title="Classes Management"
        description="Organize student groups, sections, and assign class teachers."
        icon={Layers}
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl gap-2">
            <Plus size={16} />
            Create Class
          </Button>
        }
      />

      <ContentCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by class name or section..."
            className="flex-1 max-w-md"
          />
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 animate-pulse space-y-3">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredClasses && filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((cls) => (
                <motion.button
                  key={cls._id}
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/classes/${cls._id}`)}
                  className="text-left bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {!selectedBranch && (
                        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">
                          <Globe size={10} />
                          {cls.branch?.name || 'Main Branch'}
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {cls.name} <span className="text-slate-400">•</span> Section {cls.section}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Max students: {cls.maxStudents ?? '-'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <Layers size={20} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Users size={16} className="text-slate-400" />
                    <span>{cls.assignedSubjectCount ?? 0} subjects assigned</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-16 text-center">
              <Layers size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No classes found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first class to get started.</p>
            </div>
          )}
        </div>
      </ContentCard>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white dark:bg-slate-950 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Create New Class</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ml-1 transition-colors ${shouldShowError('className', formData.className) ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: filterAlphanumericWithSpaces(e.target.value) })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 text-sm transition-all duration-200 outline-none ${
                      shouldShowError('className', formData.className) 
                        ? 'border-red-500 ring-4 ring-red-500/10' 
                        : 'border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                    placeholder="e.g. Grade Ten"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ml-1 transition-colors ${shouldShowError('section', formData.section) ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    Section (A-D only)
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={formData.section}
                    onChange={(e) => {
                      const c = e.target.value.toUpperCase().replace(/[^ABCD]/g, '').slice(0, 1);
                      setFormData({ ...formData, section: c });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 text-sm transition-all duration-200 outline-none uppercase ${
                      shouldShowError('section', formData.section) 
                        ? 'border-red-500 ring-4 ring-red-500/10' 
                        : 'border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                    placeholder="A, B, C, OR D"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ml-1 transition-colors ${shouldShowError('maxStudents', formData.maxStudents) ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    Maximum Students
                  </label>
                  <input
                    inputMode="numeric"
                    value={formData.maxStudents}
                    onChange={(e) => {
                      const next = e.target.value.replace(/[^\d]/g, '');
                      setFormData({ ...formData, maxStudents: next });
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 text-sm transition-all duration-200 outline-none ${
                      shouldShowError('maxStudents', formData.maxStudents) 
                        ? 'border-red-500 ring-4 ring-red-500/10' 
                        : 'border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                    }`}
                    placeholder="e.g. 40"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isCreating || !formValid}
                  className="w-full py-3 mt-2 rounded-xl font-bold"
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <><Check size={18} /> Create Class</>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default ClassesManagement;
