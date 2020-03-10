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
    dsn: 'https://a695e1e73b004ad2bc1f82b581f072fe@sentry.io/2071584',
    environment: 'development',
  },
};
