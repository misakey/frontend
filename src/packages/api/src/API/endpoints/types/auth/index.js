export default {
  info: {
    method: 'GET',
    path: '/auth/login/info',
  },
  confirm: {
    method: 'POST',
    path: '/users/confirm',
    withCsrfToken: true,
  },
  askConfirm: {
    method: 'POST',
    path: '/users/confirm/ask',
    withCsrfToken: true,
  },
  loginAuthStep: {
    method: 'POST',
    path: '/auth/login/authn-step',
    withCsrfToken: true,
    withBearer: true,
  },
  renewAuthStep: {
    method: 'POST',
    path: '/authn-steps',
    withCsrfToken: true,
  },
  identities: {
    update: {
      method: 'PUT',
      path: '/auth/identities',
      withCsrfToken: true,
    },
  },
  consent: {
    create: {
      method: 'POST',
      path: '/auth/consent',
      withCsrfToken: true,
    },
    info: {
      method: 'GET',
      path: '/auth/consent/info',
    },
  },
  userinfo: {
    method: 'GET',
    path: '/auth/userinfo',
  },
  signOut: {
    method: 'POST',
    path: '/auth/logout',
    withCsrfToken: true,
  },
  signUp: {
    method: 'POST',
    path: '/users',
    withCsrfToken: true,
  },
  init: {
    method: 'POST',
    path: '/login/method',
    withCsrfToken: true,
  },
  backup: {
    read: {
      method: 'GET',
      path: '/auth/backup',
      withBearer: true,
    },
  },
  secretStorage: {
    read: {
      method: 'GET',
      path: '/auth/secret-storage',
      withBearer: true,
    },
  },
  rootKeyShares: {
    create: {
      method: 'POST',
      path: '/auth/account-root-key-shares',
      withCsrfToken: true,
      withBearer: true,
    },
  },
};
