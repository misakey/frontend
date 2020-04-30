export default {
  confirm: {
    method: 'POST',
    path: '/users/confirm',
  },
  askConfirm: {
    method: 'POST',
    path: '/users/confirm/ask',
  },
  signIn: {
    method: 'POST',
    path: '/login',
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
