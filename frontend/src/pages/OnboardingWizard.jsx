import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetSchoolProfileStatusQuery, useUpdateOnboardingMutation } from '../store/adminApiSlice';
import { toast } from 'sonner';

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const { data: profileStatus, isLoading: statusLoading } = useGetSchoolProfileStatusQuery();
  const [updateOnboarding, { isLoading: isUpdating }] = useUpdateOnboardingMutation();

  const steps = [
    { id: 1, name: 'Academic Year', icon: Calendar, description: 'Set up your current academic session.' },
    { id: 2, name: 'Branches', icon: MapPin, description: 'Create your first campus or branch.' },
    { id: 3, name: 'Classes', icon: BookOpen, description: 'Define your grade levels and classes.' },
    { id: 4, name: 'Teachers', icon: GraduationCap, description: 'Add your faculty members.' },
    { id: 5, name: 'Students', icon: Users, description: 'Register your first students.' },
    { id: 6, name: 'Ready!', icon: Sparkles, description: 'You are all set to go!' },
  ];

  useEffect(() => {
    if (profileStatus?.onboarding?.isCompleted) {
      navigate('/');
    }
    if (profileStatus?.onboarding?.currentStep) {
      setCurrentStep(profileStatus.onboarding.currentStep);
    }
  }, [profileStatus, navigate]);

  const handleNext = async () => {
    if (currentStep === steps.length) {
      try {
        await updateOnboarding({ isCompleted: true }).unwrap();
        toast.success('Welcome to DugsiKabe! Onboarding completed.');
        navigate('/');
      } catch (error) {
        toast.error('Failed to complete onboarding.');
      }
      return;
    }

    const stepKeys = ['academicYear', 'branches', 'classes', 'teachers', 'students'];
    const currentStepKey = stepKeys[currentStep - 1];

    try {
      await updateOnboarding({ step: currentStepKey }).unwrap();
      setCurrentStep(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to save progress.');
    }
  };

  const renderStepContent = () => {
    if (statusLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20">
          <div className="flex flex-col items-center space-y-4"><div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="w-full max-w-md space-y-3 mt-8">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading progress...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="text-amber-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Initialize Academic Year</h3>
            <p className="text-gray-600 dark:text-gray-400">The first step to managing students is setting up your current academic year (e.g., 2025/2026).</p>
            <button 
              onClick={() => navigate('/academic-years')}
              className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
            >
              Go to Academic Years
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="text-blue-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Define Your Branches</h3>
            <p className="text-gray-600 dark:text-gray-400">DugsiKabe supports multi-campus management. Create your primary branch to start.</p>
            <button 
              onClick={() => navigate('/branches')}
              className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              Manage Branches
            </button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-emerald-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Structure Your Classes</h3>
            <p className="text-gray-600 dark:text-gray-400">Add your grades and individual classes (e.g., Grade 1A, Grade 1B).</p>
            <button 
              onClick={() => navigate('/classes')}
              className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
            >
              Manage Classes
            </button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="text-indigo-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Onboard Your Teachers</h3>
            <p className="text-gray-600 dark:text-gray-400">Add your faculty members so they can start managing attendance and results.</p>
            <button 
              onClick={() => navigate('/teachers')}
              className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
            >
              Manage Teachers
            </button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-purple-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Register Your Students</h3>
            <p className="text-gray-600 dark:text-gray-400">Finally, add your students to their respective classes.</p>
            <button 
              onClick={() => navigate('/students')}
              className="px-8 py-3 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
            >
              Manage Students
            </button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-emerald-500 w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">System Ready!</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Congratulations! Your school ecosystem is now initialized and ready for full production use.</p>
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 max-w-md mx-auto">
              <p className="text-emerald-800 dark:text-emerald-300 font-medium">You can now access all features, including finance, exams, and communication tools.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">DugsiKabe <span className="text-indigo-600">Onboarding</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Step {currentStep} of {steps.length}
          </span>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Skip to Dashboard
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 lg:p-12 gap-12">
        {/* Sidebar Steps */}
        <div className="lg:w-80 shrink-0">
          <div className="space-y-4">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 
                    isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                    'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20' : 
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-800/40' : 
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-indigo-100' : 'text-gray-400 dark:text-gray-500'}`}>Step 0{step.id}</p>
                    <h4 className="font-bold leading-tight">{step.name}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-8 lg:p-12 flex-1">
            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
              <div className="mb-12">
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">{steps[currentStep - 1]?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{steps[currentStep - 1]?.description}</p>
              </div>

              {renderStepContent()}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isUpdating || statusLoading}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-all"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={isUpdating || statusLoading}
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  {currentStep === steps.length ? 'Get Started' : 'Continue'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
