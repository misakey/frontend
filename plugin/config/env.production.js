window.env = {
  ENV: 'production',
  MATOMO: {
    SITEID: '6',
    URL: 'https://analytics.misakey.com/',
  },
  API_ENDPOINT: 'https://api.misakey.com',
  PLUGIN: true,
  AUTH: {
    authority: 'https://auth.misakey.com/_',
    client_id: 'f27effe1-5d57-4b70-bf73-939feef50f71',
    redirect_uri: 'https://api.misakey.com/app/auth/callback',
    automaticSilentRenew: false,
  },
  APP_URL: 'https://www.misakey.com',
  SENTRY: {
    debug: false,
    dsn: 'https://b9d357a41a2946f2b4d8c2b23f566a95@sentry.io/1817199',
    environment: 'production',
  },
};
