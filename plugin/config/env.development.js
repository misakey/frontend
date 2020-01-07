window.env = {
  ENV: 'development',
  API_ENDPOINT: 'https://api.misakey.com.local',
  PLUGIN: true,
  AUTH: {
    authority: 'https://auth.misakey.com.local/_',
    client_id: 'c001d00d-5ecc-beef-ca4e-b00b1e54a111',
    redirect_uri: 'https://api.misakey.com.local/app/auth/callback',
    automaticSilentRenew: false,
  },
  APP_URL: 'https://misakey.com.local',
  SENTRY: {
    debug: false,
    dsn: 'https://63f724116593491aabcfefa591f19f00@sentry.io/1816689',
    environment: 'development',
  },
  BLOCKER_RESOURCE_URL: 'https://static.misakey.com/plugin/beta',
};
