import api from '../api';
import { getBuildTenantId, mergeTenantConfig } from './config';

/**
 * Load full tenant branding + public content from backend.
 * GET /api/mobile/tenant/config/:tenantId
 */
export async function fetchTenantConfig(tenantId = getBuildTenantId()) {
  const id = String(tenantId || 'default').toLowerCase();
  if (!id || id === 'default') {
    return mergeTenantConfig(null);
  }

  try {
    const { data } = await api.get(`/mobile/tenant/config/${id}`);
    return mergeTenantConfig({
      _id: data._id,
      tenantId: data.tenantId || data.subdomain,
      subdomain: data.subdomain,
      name: data.name,
      logo: data.logo,
      code: data.code,
      isActive: data.isActive,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
      splashImage: data.splashImage,
      home: data.home,
      events: data.events || [],
      notices: data.notices || [],
    });
  } catch (e) {
    // Fallback: legacy bootstrap endpoint
    try {
      const { data } = await api.get('/auth/tenant');
      if (data.type === 'school' && data._id) {
        return mergeTenantConfig({
          _id: data._id,
          tenantId: data.subdomain,
          subdomain: data.subdomain,
          name: data.name,
          logo: data.logo,
          isActive: data.isActive,
        });
      }
    } catch {
      /* use build config */
    }
    throw e;
  }
}
