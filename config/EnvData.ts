/**
 * Environment config — aligned with wyre-dashboard/src/config/EnvData.js
 * Override with EXPO_PUBLIC_* vars in .env
 */
const EnvData = {
  REACT_APP_API_URL:
    process.env.EXPO_PUBLIC_API_URL || 'https://backend.wyreng.com/api/v1/',
  REACT_APP_API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL || 'https://backend.wyreng.com/',
};

export default EnvData;
