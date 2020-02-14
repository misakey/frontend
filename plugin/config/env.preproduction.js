window.env = {
  ENV: 'preprod',
  MATOMO: {
    SITEID: '7',
    URL: 'https://analytics.misakey.com/',
  },
  API_ENDPOINT: 'https://api.preprod.misakey.dev',
  PLUGIN: true,
  AUTH: {
    authority: 'https://auth.preprod.misakey.dev/_',
    client_id: 'f1f6c6c8-2b91-4a63-8797-cb0fffdcf3df',
    redirect_uri: 'https://api.preprod.misakey.dev/app/auth/callback',
    automaticSilentRenew: false,
  },
  APP_URL: 'https://www.preprod.misakey.dev',
  SENTRY: {
    debug: false,
    dsn: 'https://8d456528721649a39d8ec22794be3fad@sentry.io/1817198',
    environment: 'preprod',
  },
  BLOCKER_RESOURCE_URL: 'https://static.misakey.com/plugin/beta',
};
