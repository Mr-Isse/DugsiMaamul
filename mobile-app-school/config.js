/**
 * @deprecated Import from src/tenant/config.js for new code.
 * Kept for backward compatibility with existing screens.
 */
import {
  getBuildTenantId,
  getBuildTimeSchoolConfig,
  isWhitelabelBuild,
} from './src/tenant/config';

export const TENANT_ID = getBuildTenantId();
export const TENANT_SUBDOMAIN = TENANT_ID;

const build = getBuildTimeSchoolConfig();
export const API_URL = build.apiUrl;

export const SCHOOL_CONFIG = {
  tenantId: build.tenantId,
  tenantSubdomain: build.tenantSubdomain,
  appName: build.appName,
  primaryColor: build.primaryColor,
  secondaryColor: build.secondaryColor,
  accentColor: build.accentColor,
  backgroundColor: build.backgroundColor,
  textColor: build.textColor,
  apiUrl: build.apiUrl,
  features: build.features,
};

export const APP_NAME = SCHOOL_CONFIG.appName;
export const PRIMARY_COLOR = SCHOOL_CONFIG.primaryColor;
export const IS_WHITELABEL_SCHOOL = isWhitelabelBuild();
