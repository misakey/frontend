const routes = {
  _: '/',
  boxes: {
    _: '/boxes',
    read: {
      _: '/boxes/:id',
      details: '/boxes/:id/details',
      files: '/boxes/:id/files',
    },
    invitation: '/invitation',
  },
  accounts: {
    _: '/accounts',
    read: {
      _: '/accounts/:id',
    },
  },
  account: {
    _: '/account',
    profile: {
      avatar: {
        _: '/account/profile/avatar',
        upload: '/account/profile/avatar/upload',
      },
      name: '/account/profile/name',
      password: '/account/profile/password',
      notifications: '/account/profile/notifications',
      exportCrypto: '/account/profile/export-crypto',
    },
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
    forgotPassword: '/auth/password/forgot',
  },
  citizen: {
    _: '/citizen',
    contact: {
      _: '/citizen/contact',
    },
    requests: {
      _: '/citizen/requests',
      read: '/citizen/requests/:id',
    },
  },
  dpo: {
    _: '/dpo',
    services: {
      _: '/dpo/services',
      create: '/dpo/services/create',
    },
    service: {
      _: '/dpo/:mainDomain',
      claim: { _: '/dpo/:mainDomain/claim' },
      requests: {
        _: '/dpo/:mainDomain/requests',
        read: '/dpo/:mainDomain/requests/:id',
      },
    },
  },
  legals: {
    privacy: '/legals/privacy',
    tos: '/legals/tos',
  },
  requests: '/requests',
  plugin: {
    _: '/index.html',
    blank: '/plugin-blank',
  },
};

export default routes;
