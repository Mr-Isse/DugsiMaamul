# White-Label School App Build Instructions

This React Native mobile app is configured for white-label deployments - one school per app build.

## 📋 Prerequisites

- Node.js installed
- Expo CLI installed
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

## 🏗️ Building for Different Schools

### 1. Hamar Jajab School

```bash
# Development build
npx expo start

# Android development build
npx expo run-android

# iOS development build (macOS only)
npx expo run-ios

# Production build (EAS)
eas build --profile production
```

### 2. School 2

To build for a different school:

1. Update `app.json` with school-specific configuration
2. Replace assets in `assets/` folder
3. Build normally

```bash
npx expo start
npx expo run-android
```

## 🔧 Configuration Files

The app configuration is in `app.json`:

```json
{
  "expo": {
    "name": "Hamar Jajab School",
    "slug": "hamar-jajab-school",
    "extra": {
      "tenantId": "hamar_jajab",
      "primaryColor": "#0A84FF",
      "secondaryColor": "#00C7BE",
      "backgroundColor": "#F5F7FA",
      "textColor": "#1D1D1F"
    }
  }
}
```

### Configuration Fields

- `name` - App display name
- `slug` - URL slug
- `extra.tenantId` - School identifier for API requests
- `extra.primaryColor` - Brand color
- `extra.secondaryColor` - Secondary accent color
- `extra.backgroundColor` - Background color
- `extra.textColor` - Text color

## 🎨 Branding Assets

Replace the following assets in the `assets/` folder for each school:

- `logo.png` - App icon and splash screen logo
- `icon.png` - App icon (if using custom icon)
- `splash-icon.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon

## 📱 App Name Configuration

The app name is configured in `app.json`:

```json
{
  "expo": {
    "name": "Hamar Jajab School",
    "slug": "hamar-jajab-school",
    "ios": {
      "bundleIdentifier": "com.hamarjajab.school"
    },
    "android": {
      "package": "com.hamarjajab.school"
    }
  }
}
```

For different schools, update:
- `name` - Display name
- `slug` - URL slug
- `bundleIdentifier` (iOS) - Bundle ID
- `package` (Android) - Package name

## 🔐 Multi-Tenant Isolation

The app automatically includes the `X-Tenant-ID` header in all API requests based on the configured tenant ID in `app.json`. This ensures:

- Users only access their own school data
- No school selection screen
- Complete tenant isolation

## 🚀 Production Builds with EAS

### Setup EAS (if not already done)

```bash
npm install -g eas-cli
eas build:configure
```

### Build for Production

```bash
eas build --profile production
```

## 📝 Adding a New School

1. Update `app.json` with school-specific configuration
2. Replace assets in `assets/` folder
3. Build normally

```bash
npx expo start
```

## ✅ Verification Checklist

Before releasing a build for a school:

- [ ] app.json configured with correct tenant ID
- [ ] App name updated in app.json
- [ ] Bundle ID / Package name unique per school
- [ ] Logo and splash screen assets replaced
- [ ] Colors configured in app.json extra section
- [ ] Test login with school-specific credentials
- [ ] Verify tenant isolation (no cross-school data access)
- [ ] Test all features (attendance, exams, payments, etc.)

## 🐛 Troubleshooting

### Config values not loading
- Check that values are in app.json `extra` section
- Restart expo dev server: `npx expo start -c`
- Verify Constants.expoConfig is accessible

### Wrong branding displayed
- Clear app cache: `npx expo start -c`
- Rebuild the app after changing assets
- Verify app.json configuration

### Tenant isolation issues
- Check that `X-Tenant-ID` header is being sent
- Verify backend tenant detection logic
- Ensure tenant ID matches backend school code
