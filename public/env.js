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
  WHITELIST: {
    'emails': [ 'pp@vp.com', 'pp@vppp.com' ],
    'domains': [ 'misakey.com' ],
  },
  AUTO_REFRESH_LIST_DELAY: 120000,
  VALIDATE_INVITATION_CODE_URL: 'https://www.misakey.com/invitation',
  TYPEFORM_URL: 'https://misakey.typeform.com/to/hfR198',
  EARLY_BIRDS_MISAKEY_CHAT_URL: 'https://app.misakey.com/boxes/a3c24d08-f5e2-40c4-81e2-a1c3ef33c540#kbCbS4K9UMvuFEIJDngGG4dYnVVqZYLEXekCnnHTs-c'
};
