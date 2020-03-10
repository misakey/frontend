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
    dsn: 'https://a695e1e73b004ad2bc1f82b581f072fe@sentry.io/2071584',
    environment: 'production',
  },
};
