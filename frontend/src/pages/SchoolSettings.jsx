import { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Info,
  CheckCircle2,
  Globe,
  Camera,
  Upload,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { hasFeatureAccess } from '../utils/featureAccess';
import {
  useGetSchoolSettingsQuery,
  useUpdateSchoolSettingsMutation,
  useUploadImageMutation,
} from '../store/adminApiSlice';
import {
  lettersAndSpacesOnly,
  safeAddressLine,
  optionalPhoneDigits,
  optionalEmail,
  optionalMerchantDigits,
  normalizeName,
  filterLettersAndSpaces,
  filterDigitsOnly,
  numbersOnly,
} from '../utils/strictValidation';

/* ── Reusable input field ─────────────────────────────────────── */
const Field = ({ label, icon: Icon, id, type, value, onChange, placeholder, hint, error }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon size={16} className="text-gray-400 dark:text-gray-500" />
      </div>
      <input
        id={id}
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          error
            ? 'ring-2 ring-red-500 border-red-500'
            : 'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
          'placeholder-gray-400 transition-all text-sm',
        ].join(' ')}
      />
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>
    )}
    {hint && !error && (
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
    )}
  </div>
);

/* ── Page ─────────────────────────────────────────────────────── */
const SchoolSettings = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  
  const hasPaymentIntegration = hasFeatureAccess(userInfo, 'payment-integration');
  const { data: school, isLoading } = useGetSchoolSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSchoolSettingsMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const [form, setForm] = useState({
    name: '',
    logo: null,
    address: '',
    phone: '',
    email: '',
    merchantNumber: '',
  });

  useEffect(() => {
    if (school && userInfo) {
      // Update userInfo's school with enabledFeatures and other new fields!
      dispatch(setCredentials({
        ...userInfo,
        school: {
          ...userInfo.school,
          ...school
        }
      }));
      
      // Handle address object vs string for form
      let addressString = '';
      if (typeof school.address === 'object' && school.address !== null) {
        addressString = school.address.street || '';
      } else {
        addressString = school.address || '';
      }

      setForm({
        name:           school.name           || '',
        logo:           school.logo           || '',
        address:        addressString,
        phone:          school.phone          || '',
        email:          school.email          || '',
        merchantNumber: school.merchantNumber || '',
      });
    }
  }, [school, userInfo, dispatch]);

  const fieldErrors = useMemo(
    () => ({
      name: lettersAndSpacesOnly('School Name', form.name, { required: true }),
      logo: !form.logo ? 'School logo is required' : null,
      address: safeAddressLine('Address', form.address, { required: false, maxLen: 300 }),
      phone: optionalPhoneDigits('Phone', form.phone),
      email: optionalEmail('Email', form.email),
      merchantNumber: optionalMerchantDigits('Merchant Number', form.merchantNumber),
    }),
    [form]
  );

  const formValid = !Object.values(fieldErrors).some(Boolean);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Logo size should be less than 10MB');
        return;
      }
      
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('category', 'logo');

      try {
        const result = await uploadImage(uploadFormData).unwrap();
        setForm(prev => ({ ...prev, logo: result }));
        toast.success('Logo uploaded successfully');
      } catch (err) {
        toast.error('Failed to upload logo');
      }
    }
  };

  // Helper to get image URL from either string or object
  const getImageUrl = (val) => {
    if (!val) return '';
    return typeof val === 'string' ? val : val.url;
  };

  const set =
    (key, transform = (v) => v) =>
    (e) =>
      setForm((prev) => ({ ...prev, [key]: transform(e.target.value) }));

  const handleSave = async () => {
    if (!formValid) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      await updateSettings({
        name: normalizeName(form.name),
        logo: form.logo,
        address: form.address.trim(),
        phone: numbersOnly(form.phone),
        email: form.email.trim(),
        merchantNumber: filterDigitsOnly(form.merchantNumber),
      }).unwrap();
      toast.success('School settings saved!');
    } catch (err) {
      const errorMsg = err?.data?.message;
      if (errorMsg?.includes('validation')) {
        toast.error('Please check the school information and try again.');
      } else if (errorMsg?.includes('merchant') || errorMsg?.includes('payment')) {
        toast.error('Unable to update payment settings. Please check the merchant number and try again.');
      } else {
        toast.error('Unable to save school settings. Please try again.');
      }
    }
  };

  /* Loading state */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="space-y-6"><div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div></div>
      </div>
    );
  }

  /* Build the USSD preview string safely (no JSX angle-bracket issues) */
  const merchantDisplay = form.merchantNumber || '[merchant]';
  const ussdPreview     = `*799*${merchantDisplay}*[amount]#`;

  const isConfigured = Boolean(form.merchantNumber);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            Manage your school profile and payment configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !formValid}
          className={[
            'flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl',
            'font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95',
            'transition-all disabled:opacity-60 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          <Save size={16} />
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* ── School information card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Building2 size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">School Information</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Basic profile details</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Logo Upload */}
          <div className={`sm:col-span-2 flex flex-col items-center justify-center mb-4 p-4 border-2 border-dashed ${fieldErrors.logo ? 'border-red-500 bg-red-50/30' : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'} rounded-2xl`}>
            <div className="relative group">
              <div className={`h-24 w-24 rounded-2xl border-2 ${fieldErrors.logo ? 'border-red-200' : 'border-white dark:border-gray-700'} bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center overflow-hidden transition-all group-hover:shadow-md`}>
                {isUploading ? (
                  <div className="flex flex-col items-center text-primary animate-pulse">
                    <Loader2 size={24} className="animate-spin mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Uploading...</span>
                  </div>
                ) : getImageUrl(form.logo) ? (
                  <img src={getImageUrl(form.logo)} alt="School Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-primary/90 transition-colors border-2 border-white dark:border-gray-800">
                <Camera size={16} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            <p className={`mt-3 text-[11px] font-bold ${fieldErrors.logo ? 'text-red-500' : 'text-gray-400'} uppercase tracking-widest`}>
              School Logo {fieldErrors.logo ? '(Required)' : '*'}
            </p>
            {fieldErrors.logo && (
              <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.logo}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Field
              label="School Name"
              icon={Building2}
              id="school-name"
              value={form.name}
              onChange={set('name', filterLettersAndSpaces)}
              placeholder="e.g. Horizon Academy"
              error={fieldErrors.name}
            />
          </div>
          {school?.subdomain && (
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <Globe size={16} className="text-primary" />
                Tenant ID
              </label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5">
                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{school.subdomain}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Auto-generated · Cannot be changed</span>
              </div>
            </div>
          )}
          <Field
            label="Address"
            icon={MapPin}
            id="school-address"
            value={form.address}
            onChange={set('address', (v) => v.replace(/[^\p{L}\p{N}\s.,\-#/]/gu, ''))}
            placeholder="e.g. 123 Main Street, Mogadishu"
            error={fieldErrors.address}
          />
          <Field
            label="Phone"
            icon={Phone}
            id="school-phone"
            value={form.phone}
            onChange={set('phone', numbersOnly)}
            placeholder="Digits only, e.g. 252610000000"
            error={fieldErrors.phone}
          />
          <div className="sm:col-span-2">
            <Field
              label="Email"
              icon={Mail}
              id="school-email"
              type="email"
              value={form.email}
              onChange={set('email', (v) => v.replace(/[<>'"{}]/g, ''))}
              placeholder="e.g. info@school.edu"
              error={fieldErrors.email}
            />
          </div>
        </div>
      </div>

      {/* ── Payment configuration card ── */}
      {hasPaymentIntegration && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <CreditCard size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Payment Configuration</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">EVC Plus USSD mobile payment setup</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <Field
              label="EVC Plus Merchant Number"
              icon={Phone}
              id="merchant-number"
              value={form.merchantNumber}
              onChange={set('merchantNumber', filterDigitsOnly)}
              placeholder="e.g. 772123456"
              hint="Students will use this number to pay via EVC Plus USSD on their phones."
              error={fieldErrors.merchantNumber}
            />

            {/* How-it-works info box */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 flex gap-3">
              <Info size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p className="font-semibold">How students pay</p>
                <p>
                  Once saved, the student mobile app shows a{' '}
                  <strong>Pay Now</strong> button that auto-dials EVC Plus via the
                  phone&apos;s dialer using:{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded font-mono text-xs">
                    {ussdPreview}
                  </code>
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div
              className={[
                'flex items-center gap-3 rounded-xl px-4 py-3 border',
                isConfigured
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
              ].join(' ')}
            >
              <div
                className={[
                  'w-2.5 h-2.5 rounded-full',
                  isConfigured ? 'bg-green-500' : 'bg-amber-500',
                ].join(' ')}
              />
              <p
                className={[
                  'text-sm font-semibold',
                  isConfigured
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-amber-700 dark:text-amber-400',
                ].join(' ')}
              >
                {isConfigured
                  ? `Merchant number configured: ${form.merchantNumber}`
                  : 'No merchant number set — students cannot pay via mobile app yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Access note ── */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-4 flex gap-3">
        <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Only School Admins
          </span>{' '}
          can view and change school settings. Teachers and students do not have
          access to this page.
        </p>
      </div>
    </div>
  );
};

export default SchoolSettings;
