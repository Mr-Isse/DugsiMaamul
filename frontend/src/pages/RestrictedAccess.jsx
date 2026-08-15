import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Lock, ArrowLeft, CreditCard, HelpCircle, Shield } from 'lucide-react';

/**
 * Restricted Access Page — shown when a feature is not included in the school's plan.
 * Reuses existing DugsiKabe design system (indigo palette, rounded-xl, etc.).
 */
const RestrictedAccess = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const planName = userInfo?.school?.subscription?.plan?.name || 'Current Plan';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Feature Not Available
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This feature is not included in your <span className="font-semibold text-indigo-600 dark:text-indigo-400">{planName}</span> plan.
            Please contact your administrator or upgrade your subscription to access this module.
          </p>

          {/* Info badges */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Shield className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-300 text-left font-medium">
                Access to this module requires it to be enabled in your subscription plan by the Super Admin.
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-600 dark:text-gray-300 text-left font-medium">
                To upgrade your plan, contact the platform administrator for available options.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/support')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-6 font-medium uppercase tracking-wider">
          DugsiKabe — Plan-Based Access Control
        </p>
      </div>
    </div>
  );
};

export default RestrictedAccess;
