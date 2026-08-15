import React from 'react';
import { buildApiUrl } from '../utils/apiConfig';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Log error to backend
    this.logErrorToBackend(error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  logErrorToBackend = async (error, errorInfo) => {
    try {
      const errorData = {
        message: error.toString(),
        stack: error.stack,
        url: window.location.href,
        metadata: {
          componentStack: errorInfo.componentStack,
        },
        type: 'frontend',
        severity: 'high'
      };

      await fetch(buildApiUrl('/public/log-error'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });
    } catch (err) {
      console.error('Failed to log error to backend:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h.013c2.683 0 4.396-2.913 3.053-5.25L15.315 5.25c-1.344-2.337-4.707-2.337-6.05 0L4.022 14.75c-1.343 2.337.37 5.25 3.053 5.25h9.925z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              An error occurred while rendering this page.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Error Details:
                </h2>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-left">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {this.state.error && this.state.error.toString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Reload Page
                </button>
                <button 
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export { ErrorBoundary };
export default ErrorBoundary;
