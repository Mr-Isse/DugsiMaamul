import React, { useEffect, useRef } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EnterpriseSidebar from '../components/EnterpriseSidebar';
import ModernHeader from '../components/ModernHeader';
import { setCredentials } from '../store/authSlice';
import { useLazyGetEnabledFeaturesQuery } from '../store/adminApiSlice';
import { connectSocket, socket } from '../utils/socket';

const AdminLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [fetchEnabledFeatures] = useLazyGetEnabledFeaturesQuery();
  const hasAppliedInitialFeaturesRef = useRef(false);

  useEffect(() => {
    const schoolId = userInfo?.school?._id || userInfo?.school;
    if (!schoolId || !userInfo?._id) return undefined;

    connectSocket(userInfo._id, schoolId);

    const applyEnabledFeatures = (enabledFeatures) => {
      if (!Array.isArray(enabledFeatures)) return;
      
      const currentEnabledFeatures = userInfo?.school?.enabledFeatures;
      if (JSON.stringify(currentEnabledFeatures) === JSON.stringify(enabledFeatures)) {
        return;
      }
      
      dispatch(setCredentials({
        ...userInfo,
        school: {
          ...(typeof userInfo.school === 'object' && userInfo.school !== null ? userInfo.school : { _id: schoolId }),
          enabledFeatures,
        },
      }));
    };

    if (!hasAppliedInitialFeaturesRef.current && !userInfo?.school?.enabledFeatures) {
      (async () => {
        try {
          const result = await fetchEnabledFeatures().unwrap();
          applyEnabledFeatures(result.features || []);
          hasAppliedInitialFeaturesRef.current = true;
        } catch (err) {
          console.error('Failed to fetch enabled features:', err);
        }
      })();
    }

    const handleFeaturesUpdated = async (payload = {}) => {
      if (payload.schoolId && String(payload.schoolId) !== String(schoolId)) return;

      if (Array.isArray(payload.enabledFeatures)) {
        applyEnabledFeatures(payload.enabledFeatures);
        return;
      }

      const result = await fetchEnabledFeatures().unwrap();
      applyEnabledFeatures(result.features || []);
    };

    socket.on('features_updated', handleFeaturesUpdated);
    return () => {
      socket.off('features_updated', handleFeaturesUpdated);
    };
  }, [dispatch, fetchEnabledFeatures, userInfo?._id, userInfo?.school?._id]);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role === 'schooladmin' && userInfo.schoolProfileCompleted === false && !userInfo.school?._id) {
    return <Navigate to="/school-profile-setup" replace />;
  }

  const allowedRoles = ['schooladmin', 'admin', 'branchmanager', 'branch_manager'];
  if (!allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <EnterpriseSidebar variant="school" />
      <div className="flex-1 flex flex-col min-w-0">
        <ModernHeader />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <div className="w-full max-w-[1500px] mx-auto space-y-6">
            <Outlet />
          </div>
          <footer className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pb-4">
            <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} {userInfo?.school?.name || 'DugsiKabe'}. All rights reserved.
            </p>
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500">
              Version 2.0.0
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
