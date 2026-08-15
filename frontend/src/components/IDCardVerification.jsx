import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { buildApiUrl } from '../utils/apiConfig';

const IDCardVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const verifyCard = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(buildApiUrl(`/id-cards/verify/${token}`));
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('ID card not found or invalid');
          }
          throw new Error('Verification failed');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || 'Failed to verify ID card');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyCard();
    }
  }, [token]);

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: 'text-green-600',
        bg: 'bg-green-50',
        darkBg: 'bg-green-900/20',
        icon: CheckCircle,
        label: 'Active & Valid',
        message: 'This ID card is valid and currently active.'
      },
      inactive: {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        darkBg: 'bg-gray-900/20',
        icon: XCircle,
        label: 'Inactive',
        message: 'This ID card is no longer active.'
      },
      expired: {
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        darkBg: 'bg-amber-900/20',
        icon: Clock,
        label: 'Expired',
        message: 'This ID card has expired.'
      },
      suspended: {
        color: 'text-red-600',
        bg: 'bg-red-50',
        darkBg: 'bg-red-900/20',
        icon: AlertTriangle,
        label: 'Suspended',
        message: 'This ID card has been suspended.'
      },
      graduated: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        darkBg: 'bg-blue-900/20',
        icon: CheckCircle,
        label: 'Graduated',
        message: 'This student has graduated.'
      }
    };
    return configs[status] || configs.inactive;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Verifying ID card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const config = getStatusConfig('inactive');
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className={`w-20 h-20 ${config.bg} dark:${config.darkBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className={`w-10 h-10 ${config.color}`} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid ID Card
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const config = getStatusConfig(data?.status);
  const Icon = config.icon;
  const user = data?.data?.user;
  const school = data?.data?.school;
  const branch = data?.data?.branch;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Banner */}
        <div className={`mb-6 rounded-2xl ${config.bg} dark:${config.darkBg} border-2 ${data?.valid ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'} p-6 text-center`}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${data?.valid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} mb-4`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
            <span className={`text-sm font-bold uppercase tracking-wider ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {data?.valid ? 'ID Card Verification Successful' : 'ID Card Verification Failed'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {config.message}
          </p>
        </div>

        {/* ID Card Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* School Header */}
          {(school?.logo || school?.name) && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center">
              {school?.logo && (
                <img
                  src={typeof school.logo === 'string' ? school.logo : school.logo.url}
                  alt={school.name}
                  className="w-20 h-20 mx-auto mb-4 rounded-xl object-contain bg-white"
                />
              )}
              <h2 className="text-2xl font-bold text-white">
                {school?.name}
              </h2>
              {branch?.name && (
                <p className="text-indigo-100 font-medium mt-1">
                  {branch.name}
                </p>
              )}
            </div>
          )}

          {/* User Information */}
          <div className="p-8">
            {user?.photo || user?.profileImage ? (
              <div className="flex justify-center mb-6">
                <img
                  src={typeof user.photo === 'string' ? user.photo : user.photo?.url || user.profileImage}
                  alt={user?.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-indigo-100 dark:border-indigo-900"
                />
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-900">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.name || 'Unknown'}
              </h3>
              {user?.customId && (
                <p className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-lg">
                  {user.customId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.class && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Class/Grade
                  </p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {typeof user.class === 'object' ? user.class.name : user.class}
                  </p>
                </div>
              )}
              
              {data?.data?.cardNumber && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Card Number
                  </p>
                  <p className="text-gray-900 dark:text-white font-mono font-bold">
                    {data.data.cardNumber}
                  </p>
                </div>
              )}

              {data?.data?.issueDate && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Issue Date
                  </p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {formatDate(data.data.issueDate)}
                  </p>
                </div>
              )}

              {data?.data?.expiryDate && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Expiry Date
                  </p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {formatDate(data.data.expiryDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Verification Timestamp */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verified on {new Date().toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Token: {token?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mr-3"
          >
            Print Verification
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDCardVerification;
