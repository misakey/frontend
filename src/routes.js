const routes = {
  _: '/',
  boxes: {
    _: '/boxes',
    read: {
      _: '/boxes/:id',
      details: '/boxes/:id/details',
      sharing: '/boxes/:id/sharing',
      files: '/boxes/:id/files',
    },
    invitation: '/invitation',
  },
  identities: {
    _: '/identities/:id',
    avatar: {
      _: '/identities/:id/avatar',
      upload: '/identities/:id/avatar/upload',
    },
    displayName: '/identities/:id/displayName',
    public: '/identities/:id/public',
    notifications: '/identities/:id/notifications',
    colors: '/identities/:id/colors',
    accounts: {
      _: '/identities/:id/accounts/:accountId',
      password: '/identities/:id/accounts/:accountId/password',
      vault: '/identities/:id/accounts/:accountId/vault',
      delete: '/identities/:id/accounts/:accountId/delete',
    },
  },
  documents: {
    _: '/documents/:id?',
    vault: '/documents/vault',
  },
  userNotifications: {
    _: '/user-notifications',
  },
  account: {
    _: '/account',
    mailProvider: { _: '/account/mail-provider' },
    thirdParty: { setup: '/account/third-party/setup' },
  },
  auth: {
    _: '/auth',
    callback: '/callback',
    error: '/auth/error',
    recover: '/auth/recover',
    redirectToSignIn: '/login',
    signOut: '/logout',
    consent: {
      _: '/auth/consent',
    },
    signIn: {
      _: '/auth/login',
      secret: '/auth/login/secret',
    },
    signUp: {
      _: '/auth/register',
      preamble: '/auth/register/preamble',
      identifier: '/auth/register/identifier',
      handle: '/auth/register/handle',
      notifications: '/auth/register/notifications',
      password: '/auth/register/password',
      confirm: '/auth/register/confirm',
      finale: '/auth/register/finale',
    },
  },
};

export default routes;
