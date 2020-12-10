export default {
  passwordParams: {
    read: {
      method: 'GET',
      path: '/accounts/:id/pwd-params',
    },
  },
  password: {
    update: {
      method: 'PUT',
      path: '/accounts/:id/password',
      withCsrfToken: true,
    },
  },
};
