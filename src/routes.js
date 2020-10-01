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
  accounts: {
    _: '/accounts/:id?',
    avatar: {
      _: '/accounts/:id/avatar',
      upload: '/accounts/:id/avatar/upload',
    },
    displayName: '/accounts/:id/displayName',
    password: '/accounts/:id/password',
    notifications: '/accounts/:id/notifications',
    colors: '/accounts/:id/colors',
    vault: '/accounts/:id/vault',
  },
  documents: {
    _: '/documents/:id?',
    vault: '/documents/vault',
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
