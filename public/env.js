window.env = {
  ENV: 'development',
  API_ENDPOINT: 'https://api.misakey.com.local',
  GAPI_CLIENT_ID: '932593622193-cqpal0ftvukk1h5tijekhslc1j05lr1m.apps.googleusercontent.com',
  CONFIRM_CODE_TIMEOUT: 5 * 60,
  AUTH: {
    authority: 'https://auth.misakey.com.local/_',
    client_id: 'c001d00d-5ecc-beef-ca4e-b00b1e54a111',
    redirect_uri: 'https://api.misakey.com.local/auth/callback',
  },
  SENTRY: {
    debug: false,
    dsn: 'https://a695e1e73b004ad2bc1f82b581f072fe@sentry.io/2071584',
    environment: 'development',
  },
  MATOMO: {
    ENABLED: false,
  },
  CATEGORIES: [
    'shops',
    'gaming',
  ],
  ACTIVE_SERVICES: [
    'fnac.com',
    'misakey.com.local',
    'vp.com',
    'darty.com',
    'veepee.fr',
    'showroomprive.com',
    'rakuten.com',
    'yves-rocher.fr',
    'leroymerlin.fr',
    'auchan.fr',
    'conforama.fr'
  ],
  TYPEFORM_URL: 'https://misakey.typeform.com/to/hfR198'
};
