/**
 * Dynamic Expo config.
 *
 * The static config lives in app.json; this file only overrides the Firebase
 * config file paths so EAS cloud builds can use the file-type environment
 * variables (GOOGLE_SERVICES_JSON / GOOGLE_SERVICE_INFO_PLIST). The Firebase
 * files are gitignored, so EAS does not upload them with the project.
 *
 * Locally (no env vars set) the files in the project root are used, exactly as
 * before.
 */
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
  },
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
