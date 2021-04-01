const routes = {
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
      security: '/identities/:id/accounts/:accountId/security',
      vault: '/identities/:id/accounts/:accountId/vault',
      delete: '/identities/:id/accounts/:accountId/delete',
    },
  },
};

export default routes;
