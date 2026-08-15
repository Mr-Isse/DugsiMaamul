const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 1. Robust Local Env Loading
const envFile = process.env.ENVFILE || '.env';
const envPath = path.isAbsolute(envFile) ? envFile : path.join(__dirname, envFile);

if (fs.existsSync(envPath)) {
  console.log(`[AppConfig] Loading local environment from: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log(`[AppConfig] No local .env file found at ${envPath}. Using process.env (EAS/CI).`);
}

module.exports = ({ config }) => {
  // 2. Variable Resolution with Fallbacks
  const schoolSubdomain = (
    process.env.SCHOOL_SUBDOMAIN ||
    process.env.TENANT_ID ||
    "default"
  ).toLowerCase();

  const appName =
    process.env.APP_NAME ||
    (schoolSubdomain !== "default"
      ? schoolSubdomain.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "School Management System");

  const slug = "school-management-system";
  const primaryColor = process.env.PRIMARY_COLOR || "#0A84FF";

  // 3. API_URL Security & Validation
  let apiUrl = process.env.API_URL || "";

  // EAS_BUILD_RUNNER only exists during actual build — not during `eas update`
  const isActualBuild = !!process.env.EAS_BUILD_RUNNER;
  const isLocalIp = apiUrl && (apiUrl.includes('192.168.') || apiUrl.includes('10.') || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'));

  if (isActualBuild && !apiUrl) {
    throw new Error("CRITICAL: API_URL is missing in production build. Check eas.json or .env file.");
  }

  if (isActualBuild && isLocalIp) {
    console.warn(`[AppConfig] WARNING: Production build detected with local/internal API_URL: ${apiUrl}`);
  }

  // 4. EAS Update branch — profile name ka qaado
  const easBuildProfile = process.env.EAS_BUILD_PROFILE || "development";

  return {
    ...config,
    name: appName,
    slug: slug,
    owner: "mr-isse",
    version: "1.0.0",
    orientation: "portrait",
    icon: process.env.APP_ICON || "./assets/images/icon.png",
    scheme: "hamarboarding",
    userInterfaceStyle: "automatic",

    // ✅ EAS Update config — kun halkan
    updates: {
      url: "https://u.expo.dev/527ca819-1dff-4385-a391-d42fd741173d",
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD",
    },
    runtimeVersion: "1.0.0",

    splash: {
      image: process.env.SPLASH_IMAGE || "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: primaryColor
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_ID || "com.mrisse.schoolmanagementsystem"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: process.env.APP_ICON || "./assets/images/icon.png",
        backgroundColor: primaryColor
      },
      package: process.env.PACKAGE_NAME || "com.mrisse.schoolmanagementsystem",
      edgeToEdgeEnabled: true,
      permissions: ["INTERNET", "CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
      usesCleartextTraffic: true
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-web-browser",
      ["expo-splash-screen", {
        "image": process.env.SPLASH_IMAGE || "./assets/images/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": primaryColor
      }]
    ],
    experiments: {
      typedRoutes: true
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      ...(config.extra || {}),
      schoolSubdomain,
      tenantId: schoolSubdomain,
      appName,
      primaryColor: primaryColor,
      secondaryColor: process.env.SECONDARY_COLOR || "#00C7BE",
      backgroundColor: process.env.BACKGROUND_COLOR || "#F5F7FA",
      textColor: process.env.TEXT_COLOR || "#1D1D1F",
      apiUrl: apiUrl || "https://schoolmangementbackend-deployment.up.railway.app/api/v1",
      eas: {
        projectId: "527ca819-1dff-4385-a391-d42fd741173d"
      }
    }
  };
};