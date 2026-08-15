import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../store/apiSlice';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();
  const [resendVerification] = useResendVerificationMutation();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token).unwrap();
        setStatus('success');
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      await resendVerification(email).unwrap();
      toast.success('Verification email resent!');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to resend email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
        </div>

        {status === 'verifying' && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              Your email has been verified successfully! Redirecting to login...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              {error?.data?.userMessage || 'The verification link is invalid or has expired.'}
            </p>
            
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                onClick={handleResend}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
              >
                Resend Verification Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}