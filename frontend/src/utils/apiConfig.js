const DEFAULT_API_BASE = 'https://schoolmangementbackend-deployment.up.railway.app/api/v1';

export const getApiBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE).trim();
  return configured.replace(/\/+$/, '');
};

export const buildApiUrl = (path = '') => {
  const base = getApiBaseUrl();
  const cleanPath = (path || '').replace(/^\/+/, '').replace(/^api\/v\d+\//i, '');
  return `${base}/${cleanPath}`.replace(/([^:]\/)\+/g, '$1');
};

export const getApiOrigin = () => {
  const base = getApiBaseUrl();
  return base.replace(/\/api(?:\/v\d+)?$/i, '');
};
