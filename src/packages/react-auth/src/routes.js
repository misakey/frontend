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
};

export default routes;
