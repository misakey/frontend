export default {
  passwordParams: {
    read: {
      method: 'GET',
      path: '/accounts/:id/pwd-params',
    },
  },
  password: {
    create: {
      method: 'POST',
      path: '/accounts/:id/set-password',
      withCsrfToken: true,
    },
    update: {
      method: 'PUT',
      path: '/accounts/:id/password',
      withCsrfToken: true,
    },
  },
};
