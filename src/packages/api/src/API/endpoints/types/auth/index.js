export default {
  info: {
    method: 'GET',
    path: '/auth/login/info',
  },
  confirm: {
    method: 'POST',
    path: '/users/confirm',
  },
  askConfirm: {
    method: 'POST',
    path: '/users/confirm/ask',
  },
  loginAuthStep: {
    method: 'POST',
    path: '/auth/login/authn-step',
  },
  renewAuthStep: {
    method: 'POST',
    path: '/authn-steps',
  },
  consent: {
    method: 'POST',
    path: '/auth/consent',
  },
  signOut: {
    method: 'POST',
    path: '/auth/logout',
    auth: true,
  },
  signUp: {
    method: 'POST',
    path: '/users',
  },
  init: {
    method: 'POST',
    path: '/login/method',
  },
};
