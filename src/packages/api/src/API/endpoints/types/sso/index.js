export default {
  create: {
    method: 'POST',
    path: '/sso-clients',
    withCsrfToken: true,
  },
  update: {
    method: 'PATCH',
    path: '/sso-clients/:id',
    withCsrfToken: true,
  },
  read: {
    method: 'GET',
    path: '/sso-clients/:id',
  },
  secret: {
    create: {
      method: 'POST',
      path: '/sso-clients/:id/secret',
      withCsrfToken: true,
    },
  },
};
