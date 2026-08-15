import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  X,
  Check,
  School,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Package
} from 'lucide-react';
import { 
  useGetSchoolFeaturesQuery, 
  useUpdateSchoolFeatureMutation, 
  useResetSchoolFeaturesMutation,
  useGetFeatureRegistryQuery,
  useGetSchoolsQuery
} from '../../store/superAdminApiSlice';
import { toast } from 'sonner';
import { PageHeader, Panel, Badge, superAdminInputClass, superAdminBtnPrimary, superAdminBtnGhost } from '../../components/superadmin/SuperAdminShell';
import ConfirmModal from '../../components/ConfirmModal';

const SchoolFeatures = () => {
  const [search, setSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolSelector, setShowSchoolSelector] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    school: null,
  });
  const [featureConfirm, setFeatureConfirm] = useState({
    isOpen: false,
    featureKey: '',
    featureLabel: '',
    nextEnabled: false,
    reason: '',
  });

  // Fetch all schools
  const { data: schoolsData = [], isLoading: loadingSchools } = useGetSchoolsQuery();
  const schools = Array.isArray(schoolsData) ? schoolsData : [];

  // Fetch feature registry
  const { data: registryData } = useGetFeatureRegistryQuery();
  const featureRegistry = registryData?.features || [];
  const byCategory = registryData?.byCategory || {};
  
  // Create a map for feature codes to display labels
  const featureLabelMap = {};
  featureRegistry.forEach(f => {
    featureLabelMap[f.code] = f.label;
  });

  // Filter schools
  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    (school.email && school.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Select school
  const selectSchool = (school) => {
    setSelectedSchool(school);
    setShowSchoolSelector(false);
  };

  // Feature management
  const { 
    data: schoolFeaturesData, 
    isLoading: featuresLoading, 
    refetch: refetchFeatures 
  } = useGetSchoolFeaturesQuery(selectedSchool?._id, { 
    skip: !selectedSchool?._id 
  });

  const [updateSchoolFeature] = useUpdateSchoolFeatureMutation();
  const [resetSchoolFeatures] = useResetSchoolFeaturesMutation();
  const featureData = schoolFeaturesData?.data || schoolFeaturesData;

  const openToggleFeature = (featureKey, currentEnabled) => {
    setFeatureConfirm({
      isOpen: true,
      featureKey,
      featureLabel: featureLabelMap[featureKey] || featureKey,
      nextEnabled: !currentEnabled,
      reason: '',
    });
  };

  const handleToggleFeature = async () => {
    try {
      const { featureKey, nextEnabled, reason } = featureConfirm;
      await updateSchoolFeature({
        schoolId: selectedSchool._id,
        featureKey,
        isEnabled: nextEnabled,
        reason,
      }).unwrap();
      
      toast.success(`Feature ${featureLabelMap[featureKey] || featureKey} ${nextEnabled ? 'enabled' : 'disabled'} successfully`);
      setFeatureConfirm({ isOpen: false, featureKey: '', featureLabel: '', nextEnabled: false, reason: '' });
      refetchFeatures();
    } catch (error) {
      const errorMsg = error.data?.userMessage || error.data?.message || 'Failed to update feature';
      toast.error(errorMsg);
    }
  };

  const handleResetFeatures = () => {
    setConfirmModal({
      isOpen: true,
      school: selectedSchool,
    });
  };

  const confirmResetFeatures = async () => {
    try {
      await resetSchoolFeatures(selectedSchool._id).unwrap();
      toast.success('Features reset to plan defaults');
      refetchFeatures();
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      const errorMsg = error.data?.userMessage || error.data?.message || 'Failed to reset features';
      toast.error(errorMsg);
    }
  };

  // Get feature enabled status
  const isFeatureEnabled = (featureKey) => {
    if (!featureData) return true;
    const override = featureData?.overrides?.find(o => o.featureKey === featureKey);
    if (override !== undefined) {
      return override.isEnabled;
    }
    // Try plan features, then school's enabled modules, then default to true
    const planFeatures = featureData?.plan?.features || [];
    const schoolEnabledModules = featureData?.school?.enabledModules || selectedSchool?.settings?.enabledModules || [];
    if (planFeatures.includes('ALL_MODULES')) return true;
    if (planFeatures.length > 0) {
      return planFeatures.includes(featureKey);
    }
    if (schoolEnabledModules.includes('ALL_MODULES')) return true;
    if (schoolEnabledModules.length > 0) {
      return schoolEnabledModules.includes(featureKey);
    }
    return true;
  };

  // Get all features to display
  const planFeatures = featureData?.plan?.features || [];
  const schoolEnabledModules = featureData?.school?.enabledModules || selectedSchool?.settings?.enabledModules || [];
  const hasAllModules = planFeatures.includes('ALL_MODULES') || (!planFeatures.length && schoolEnabledModules.includes('ALL_MODULES'));
  
  // Determine which features to display
  let featuresToDisplay = [];
  if (hasAllModules) {
    // If plan has ALL_MODULES or school has ALL_MODULES, show all registered features
    featuresToDisplay = featureRegistry.map(f => f.code);
  } else if (planFeatures.length > 0) {
    // First use plan features
    featuresToDisplay = planFeatures;
  } else if (schoolEnabledModules.length > 0) {
    // Then use school's enabled modules
    featuresToDisplay = schoolEnabledModules;
  } else {
    // Default to all features if nothing is set
    featuresToDisplay = featureRegistry.map(f => f.code);
  }
  
  const overrideMap = {};
  featureData?.overrides?.forEach(o => {
    overrideMap[o.featureKey] = o.isEnabled;
  });

  // Toggle category expansion
  const toggleExpand = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="School Features Management" 
        subtitle="Control feature availability per school tenant" 
      />

      {showSchoolSelector ? (
        <Panel className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={(e) => e.preventDefault()} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search schools by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${superAdminInputClass} pl-12`}
              />
            </form>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">School Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingSchools ? (
                    [1,2,3].map(i => (
                      <tr key={i}>
                        <td colSpan={3} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-full" /></td>
                      </tr>
                    ))
                  ) : filteredSchools.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <School className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                          <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-xs">No schools found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSchools.map((school) => (
                      <tr key={school._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black shadow-inner">
                              {school.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{school.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mt-0.5">{school.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 capitalize">
                              {school.subscription?.plan?.name || school.subscription?.type || 'Trial'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end">
                            <button 
                              onClick={() => selectSchool(school)}
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Manage Features"
                            >
                              <SlidersHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                setShowSchoolSelector(true);
                setSelectedSchool(null);
              }}
              className={superAdminBtnGhost}
            >
              ← Back to Schools
            </button>
            <button 
              onClick={handleResetFeatures}
              className="px-4 py-2 text-sm font-bold text-amber-500 hover:bg-amber-500/10 rounded-xl border border-amber-500/20 transition-all"
            >
              Reset to Defaults
            </button>
          </div>

          <Panel className="p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black shadow-inner">
                {selectedSchool.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedSchool.name}</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{selectedSchool.email}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Package size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {featureData?.plan?.name || 'Trial Plan'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Features</h3>
                {hasAllModules && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                    All Modules
                  </span>
                )}
              </div>

              {featuresLoading ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 animate-pulse rounded w-1/2" />
                  </div>
                ))
              ) : featuresToDisplay.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-bold">No features available for this plan</p>
                </div>
              ) : (
                // Organize features by category
                <div className="space-y-3">
                  {Object.entries(byCategory).map(([category, features]) => {
                    // Filter features to only those that are in the plan
                    const categoryFeatures = features.filter(f => featuresToDisplay.includes(f.code));
                    if (categoryFeatures.length === 0) return null;

                    const isExpanded = expandedCategories[category] !== false;
                    
                    return (
                      <div key={category} className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                        {/* Category header */}
                        <button 
                          onClick={() => toggleExpand(category)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{category}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {categoryFeatures.length}
                          </span>
                        </button>

                        {/* Features in category */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2">
                            {categoryFeatures.map(({ code, label }) => {
                              const enabled = isFeatureEnabled(code);
                              const hasOverride = overrideMap[code] !== undefined;
                              
                              return (
                                <div key={code} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                                    <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {hasOverride ? 'Custom setting' : 'Plan default'}
                                      {overrideMap[code] === false ? ' - disabled by override' : ''}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => openToggleFeature(code, enabled)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                      enabled 
                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                        : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-400 dark:border-slate-500 hover:bg-slate-400 dark:hover:bg-slate-500'
                                    }`}
                                  >
                                    {enabled ? <><Check size={12} className="inline mr-1" /> Enabled</> : 'Disabled'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmResetFeatures}
        title="Reset Features"
        message={`Are you sure you want to reset all feature settings for ${confirmModal.school?.name} to plan defaults?`}
        confirmText="Reset"
        type="warning"
      />

      <AnimatePresence>
        {featureConfirm.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-800"
            >
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-black font-heading text-white tracking-tight">
                      {featureConfirm.nextEnabled ? 'Enable Feature' : 'Disable Feature'}
                    </h3>
                    <p className="text-slate-400 font-medium leading-relaxed mt-2">
                      {featureConfirm.featureLabel} for {selectedSchool?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setFeatureConfirm({ isOpen: false, featureKey: '', featureLabel: '', nextEnabled: false, reason: '' })}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Reason
                </label>
                <textarea
                  value={featureConfirm.reason}
                  onChange={(event) => setFeatureConfirm(prev => ({ ...prev, reason: event.target.value }))}
                  placeholder="Reason for audit log..."
                  className="w-full min-h-[110px] rounded-2xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={500}
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setFeatureConfirm({ isOpen: false, featureKey: '', featureLabel: '', nextEnabled: false, reason: '' })}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all duration-300 active:scale-95 border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleFeature}
                    className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg active:scale-95 ${
                      featureConfirm.nextEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {featureConfirm.nextEnabled ? 'Enable' : 'Disable'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchoolFeatures;
