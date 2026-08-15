import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  useCompleteSchoolProfileMutation,
  useUploadImageMutation,
  useGetSchoolProfileStatusQuery
} from '../store/adminApiSlice';
import { setCredentials } from '../store/authSlice';
import { setSchoolTenantFromUser } from '../store/tenantSlice';
import { useAppToast } from '../hooks/useAppToast';
import { School, Building2, MapPin, Phone, Mail, CreditCard, Loader2, CheckCircle, Camera, Upload, Globe, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const SCHOOL_TYPES = [
  'Primary School',
  'Secondary School',
  'High School',
  'Elementary School',
  'Middle School',
  'K-12 School',
  'Vocational School',
  'Islamic School/Madrasa',
  'International School',
  'Private School',
  'Public School',
  'Other'
];

const SchoolProfileSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, showSuccess, showLoading, dismissToast } = useAppToast();
  
  const { userInfo } = useSelector((state) => state.auth);
  const [completeProfile] = useCompleteSchoolProfileMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const { data: profileStatus, isLoading: isCheckingStatus } = useGetSchoolProfileStatusQuery(null, {
    skip: !userInfo,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    schoolType: '',
    country: '',
    city: '',
    logo: null,
    address: '',
    phone: '',
    email: '',
    merchantNumber: '',
    subscriptionType: 'trial',
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError('Logo size should be less than 10MB');
        return;
      }
      
      // 1. Show preview locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 2. Upload to Cloudinary immediately
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('category', 'logo');

      try {
        const result = await uploadImage(uploadFormData).unwrap();
        setFormData(prev => ({ ...prev, logo: result }));
        showSuccess('Logo uploaded successfully');
      } catch (err) {
        showError('Failed to upload logo to cloud storage');
        setLogoPreview(null);
      }
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userInfo) {
      navigate('/login', { replace: true });
    }
  }, [userInfo, navigate]);
  
  // Redirect to dashboard ONLY if the API confirms profile is truly complete
  // (Don't rely solely on Redux state — it can be stale if new required fields were added)
  useEffect(() => {
    if (profileStatus && !isCheckingStatus) {
      if (profileStatus.schoolProfileCompleted === true || profileStatus.completed === true) {
        // Profile is genuinely complete — update auth + tenant then redirect
        const updatedUser = {
          ...userInfo,
          schoolProfileCompleted: true,
          school: profileStatus.school || userInfo?.school
        };
        dispatch(setCredentials(updatedUser));
        if (profileStatus.school) {
          dispatch(setSchoolTenantFromUser(profileStatus.school));
        }
        navigate('/', { replace: true });
      }
    }
  }, [profileStatus, isCheckingStatus, navigate, dispatch, userInfo]);

  // Pre-fill form with existing school data (so admin only fills missing fields)
  useEffect(() => {
    if (profileStatus?.school) {
      const s = profileStatus.school;
      setFormData(prev => ({
        name: s.name || prev.name,
        schoolType: s.schoolType || prev.schoolType,
        country: s.country || prev.country,
        city: s.city || prev.city,
        logo: s.logo || prev.logo,
        address: s.address || prev.address,
        phone: s.phone || prev.phone,
        email: s.email || prev.email,
        merchantNumber: s.merchantNumber || prev.merchantNumber,
        subscriptionType: prev.subscriptionType,
      }));
      if (s.logo?.url) setLogoPreview(s.logo.url);
    }
  }, [profileStatus?.school]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.logo) {
      showError('School logo is required.');
      return false;
    }
    if (!formData.name.trim()) {
      showError('School name is required.');
      return false;
    }
    if (!formData.schoolType.trim()) {
      showError('School type is required.');
      return false;
    }
    if (!formData.country.trim()) {
      showError('Country is required.');
      return false;
    }
    if (!formData.city.trim()) {
      showError('City is required.');
      return false;
    }
    if (!formData.address.trim()) {
      showError('Address is required.');
      return false;
    }
    if (!formData.phone.trim()) {
      showError('Phone number is required.');
      return false;
    }
    if (!formData.email.trim()) {
      showError('School email is required.');
      return false;
    }
    if (!formData.merchantNumber.trim()) {
      showError('Merchant / Account number is required.');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const loadingToast = showLoading('Completing school setup...');
    setIsSubmitting(true);
    
    try {
      const result = await completeProfile(formData).unwrap();
      
      dismissToast(loadingToast);
      showSuccess(result.userMessage || 'School profile completed successfully!');
      
      // Build the updated user info with the new school data
      const updatedUser = {
        ...userInfo,
        schoolProfileCompleted: true,
        school: result.school
      };

      // 1. Persist updated user to Redux + localStorage
      dispatch(setCredentials(updatedUser));

      // 2. Set the school as the active tenant so all subsequent
      //    API calls carry the correct x-tenant-id / X-School-Slug headers
      dispatch(setSchoolTenantFromUser(result.school));

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
      
    } catch (err) {
      dismissToast(loadingToast);
      showError(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Complete Your School Profile</h1>
                <p className="text-indigo-100 text-sm">Set up your school to access all features</p>
              </div>
            </div>
          </div>
          
          {/* Missing Fields Banner */}
          {profileStatus?.missingFields?.length > 0 && (
            <div className="mx-8 mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">Missing required fields:</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {profileStatus.missingFields.map(f => f.label).join(', ')}
              </p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative group">
                  <div className={`h-28 w-28 rounded-2xl border-2 border-dashed ${!formData.logo ? 'border-red-300 bg-red-50/50' : 'border-indigo-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'} flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-500`}>
                    {isUploading ? (
                      <div className="flex flex-col items-center text-indigo-600">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Uploading...</span>
                      </div>
                    ) : logoPreview ? (
                      <img src={logoPreview} alt="School Logo" className="h-full w-full object-cover" />
                    ) : (
                      <div className={`flex flex-col items-center ${!formData.logo ? 'text-red-400' : 'text-gray-400'}`}>
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Upload Logo</span>
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors border-2 border-white dark:border-gray-800">
                    <Camera className="h-5 w-5" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <p className={`mt-4 text-xs font-medium ${!formData.logo ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
                  School Logo { !formData.logo ? '(Required to continue)' : '✓'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  School Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your school name"
                  required
                />
                {formData.name.trim() && (
                  <div className="mt-2 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2">
                    <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="text-xs text-indigo-700 dark:text-indigo-300">
                      Tenant ID will be:{' '}
                      <span className="font-bold font-mono">
                        {formData.name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  School Type *
                </label>
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="" disabled>Select school type</option>
                  {SCHOOL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Globe className="h-4 w-4 text-indigo-600" />
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Country"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="City"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter school address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="h-4 w-4 text-indigo-600" />
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="+252612345678"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="school@example.com"
                    required
                  />
                </div>
              </div>

              {/* Merchant / Account Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  Merchant / Account Number *
                </label>
                <input
                  type="text"
                  name="merchantNumber"
                  value={formData.merchantNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. EVC Plus merchant number"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Used for receiving school fee payments via mobile money.</p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 You can always update your school profile later from the Settings page.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SchoolProfileSetup;
