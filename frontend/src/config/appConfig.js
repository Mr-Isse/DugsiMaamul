/**
 * DugsiMaamul - Enterprise School Management ERP
 * Global Application Configuration
 * Centralized configuration for all application settings
 */

const appConfig = {
  // ─── APPLICATION INFO ─────────────────────────────────────────────────────────────
  app: {
    name: 'DugsiMaamul',
    displayName: 'DugsiMaamul ERP',
    version: '1.0.0',
    description: 'Enterprise Multi-Tenant School Management System',
    author: 'DugsiMaamul Team',
    license: 'Proprietary',
  },

  // ─── API CONFIGURATION ─────────────────────────────────────────────────────────────
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // ─── PAGINATION DEFAULTS ──────────────────────────────────────────────────────────
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    maxPageSize: 100,
  },

  // ─── DATE FORMATS ────────────────────────────────────────────────────────────────
  dateFormats: {
    display: 'MMM dd, yyyy',
    short: 'MM/dd/yyyy',
    long: 'MMMM dd, yyyy',
    time: 'HH:mm',
    dateTime: 'MMM dd, yyyy HH:mm',
    iso: 'yyyy-MM-dd',
    isoTime: 'HH:mm:ss',
    isoDateTime: 'yyyy-MM-dd HH:mm:ss',
  },

  // ─── CURRENCY FORMATS ─────────────────────────────────────────────────────────────
  currency: {
    defaultCurrency: 'USD',
    locale: 'en-US',
    symbol: '$',
    precision: 2,
    formats: {
      standard: '${amount}',
      compact: '${amount}',
      accounting: '(${amount})',
    },
  },

  // ─── TIMEZONE ─────────────────────────────────────────────────────────────────────
  timezone: {
    default: 'UTC',
    userTimezone: true, // Use user's timezone if available
  },

  // ─── LANGUAGE ──────────────────────────────────────────────────────────────────────
  language: {
    default: 'en',
    supported: ['en', 'so', 'ar'],
    fallback: 'en',
  },

  // ─── STORAGE KEYS ─────────────────────────────────────────────────────────────────
  storageKeys: {
    // Authentication
    accessToken: 'dugsi_access_token',
    refreshToken: 'dugsi_refresh_token',
    tokenExpiry: 'dugsi_token_expiry',
    
    // User
    user: 'dugsi_user',
    userPreferences: 'dugsi_user_preferences',
    
    // Theme
    theme: 'dugsi_theme',
    
    // Tenant
    tenant: 'dugsi_tenant',
    tenantSettings: 'dugsi_tenant_settings',
    
    // Permissions
    permissions: 'dugsi_permissions',
    roles: 'dugsi_roles',
    
    // UI State
    sidebarCollapsed: 'dugsi_sidebar_collapsed',
    tablePreferences: 'dugsi_table_preferences',
    
    // Session
    lastActivity: 'dugsi_last_activity',
    sessionId: 'dugsi_session_id',
  },

  // ─── THEME KEYS ───────────────────────────────────────────────────────────────────
  themeKeys: {
    light: 'light',
    dark: 'dark',
    system: 'system',
  },

  // ─── PERMISSION KEYS ───────────────────────────────────────────────────────────────
  permissionKeys: {
    // Super Admin
    SUPER_ADMIN: 'super_admin',
    
    // School Admin
    SCHOOL_ADMIN: 'school_admin',
    
    // Branch Manager
    BRANCH_MANAGER: 'branch_manager',
    
    // Teachers
    TEACHER: 'teacher',
    
    // Students
    STUDENT: 'student',
    
    // Parents
    PARENT: 'parent',
    
    // Staff
    STAFF: 'staff',
    
    // Accountant
    ACCOUNTANT: 'accountant',
    
    // Librarian
    LIBRARIAN: 'librarian',
  },

  // ─── FILE UPLOAD LIMITS ────────────────────────────────────────────────────────────
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // ─── SECURITY ─────────────────────────────────────────────────────────────────────
  security: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    warningTimeout: 25 * 60 * 1000, // 25 minutes (warning before timeout)
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
  },

  // ─── PERFORMANCE ───────────────────────────────────────────────────────────────────
  performance: {
    debounceDelay: 300,
    throttleDelay: 200,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    lazyLoadThreshold: 100, // pixels
  },

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────────
  notifications: {
    autoHideDelay: 5000, // 5 seconds
    maxNotifications: 5,
    position: 'top-right',
  },

  // ─── TABLE DEFAULTS ───────────────────────────────────────────────────────────────
  tableDefaults: {
    sortable: true,
    filterable: true,
    resizable: false,
    selectable: false,
    stickyHeader: true,
    pageSize: 20,
  },

  // ─── EXPORT/IMPORT ─────────────────────────────────────────────────────────────────
  export: {
    maxRows: 10000,
    formats: ['csv', 'xlsx', 'pdf'],
    defaultFormat: 'xlsx',
  },
  import: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['csv', 'xlsx'],
  },

  // ─── VALIDATION LIMITS ─────────────────────────────────────────────────────────────
  validation: {
    email: {
      maxLength: 255,
    },
    phone: {
      minLength: 10,
      maxLength: 20,
    },
    name: {
      minLength: 2,
      maxLength: 100,
    },
    description: {
      maxLength: 1000,
    },
    url: {
      maxLength: 2048,
    },
  },

  // ─── FEATURE FLAGS ─────────────────────────────────────────────────────────────────
  features: {
    enableDarkMode: true,
    enableMultiLanguage: true,
    enableNotifications: true,
    enableRealTime: true,
    enableOfflineMode: false,
    enableAuditLog: true,
    enableTwoFactorAuth: true,
    enableSSO: false,
  },
};

export default appConfig;
