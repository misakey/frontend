export default {
  checkAuthable: {
    method: 'PUT',
    path: '/identities/authable',
  },
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
  signOut: {
    method: 'POST',
    path: '/logout',
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
