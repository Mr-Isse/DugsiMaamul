import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { bootstrapTenantSchool } from '../store/schoolSlice';
import { getBuildTimeSchoolConfig, isWhitelabelBuild, mergeTenantConfig } from './config';

const TenantContext = createContext({
  tenant: null,
  tenantId: 'default',
  loading: true,
  error: null,
});

export const TenantProvider = ({ children }) => {
  const dispatch = useDispatch();
  const {
    selectedSchool,
    loading: schoolLoading,
    bootstrapStatus,
    bootstrapError,
  } = useSelector((state) => state.school);

  useEffect(() => {
    if (isWhitelabelBuild() && bootstrapStatus === 'idle') {
      dispatch(bootstrapTenantSchool());
    }
  }, [dispatch, bootstrapStatus]);

  const tenant = useMemo(
    () => mergeTenantConfig(selectedSchool),
    [selectedSchool]
  );

  const value = {
    tenant,
    tenantId: tenant.tenantId,
    loading: schoolLoading,
    error: bootstrapError,
    isReady: isWhitelabelBuild() ? bootstrapStatus === 'success' : true,
    buildConfig: getBuildTimeSchoolConfig(),
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => useContext(TenantContext);
