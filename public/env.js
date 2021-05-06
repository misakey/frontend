const SELF_CLIENT_ID = 'cc411b8f-28bf-4d4e-abd9-99226b41da27';

window.env = {
  ENV: 'development',
  API_ENDPOINT: 'https://api.misakey.com.local',
  API_WS_ENDPOINT: 'wss://api.misakey.com.local',
  GAPI_CLIENT_ID: '932593622193-cqpal0ftvukk1h5tijekhslc1j05lr1m.apps.googleusercontent.com',
  SELF_CLIENT: {
    id: SELF_CLIENT_ID,
    name: 'Misakey',
    logoUri: 'https://static.misakey.com/ssoClientsLogo/misakey.png',
  },
  CONFIRM_CODE_TIMEOUT: 5 * 60,
  AUTH: {
    authority: 'https://auth.misakey.com.local/_',
    clientId: SELF_CLIENT_ID,
    redirectUri: 'https://api.misakey.com.local/auth/callback',
    enableAutomaticSilentRenew: true,
  },
  SENTRY: {
    debug: false,
    dsn: 'https://a695e1e73b004ad2bc1f82b581f072fe@sentry.io/2071584',
    environment: 'development',
  },
  MATOMO: {
    ENABLED: false,
    URL: 'https://analytics.misakey.com',
    SITEID: '2',
  },
};
