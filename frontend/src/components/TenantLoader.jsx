import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTenantQuery } from '../store/apiSlice';
import { setTenantInfo, setTenantError, setSchoolTenantFromUser } from '../store/tenantSlice';
import { Skeleton } from './ui/skeleton';

const TenantLoader = ({ children }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const skipHostTenant = userInfo?.role === 'schooladmin' && Boolean(userInfo?.school);

  const { data, error, isLoading } = useGetTenantQuery(undefined, {
    skip: skipHostTenant,
  });

  useEffect(() => {
    if (userInfo?.role === 'schooladmin' && userInfo.school) {
      dispatch(setSchoolTenantFromUser(userInfo.school));
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (skipHostTenant || !data) return;
    dispatch(setTenantInfo(data));
  }, [data, dispatch, skipHostTenant]);

  useEffect(() => {
    if (error && !skipHostTenant) {
      dispatch(setTenantError(error));
    }
  }, [error, dispatch, skipHostTenant]);

  const isAuthPage = window.location.pathname.includes('/login') || 
                    window.location.pathname.includes('/register');

  if (!skipHostTenant && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Skeleton className="h-12 w-48 mb-4 mx-auto" />
          <p className="text-gray-500">Loading context...</p>
        </div>
      </div>
    );
  }

  if (!isAuthPage && !skipHostTenant && error && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">School Not Found</h2>
          <p className="text-red-600 mb-4">
            {error?.data?.userMessage || "The school you are trying to access does not exist or has been suspended."}
          </p>
          <a href="/" className="text-primary font-semibold text-sm hover:underline">
            Go to DugsiKabe
          </a>
        </div>
      </div>
    );
  }

  if (
    skipHostTenant ||
    (data && (data.type === 'school' || data.type === 'dev' || data.type === 'superadmin'))
  ) {
    return children;
  }

  return children;
};

export default TenantLoader;
