export default {
  create: {
    method: 'POST',
    path: '/sso-clients',
    auth: true,
  },
  update: {
    method: 'PATCH',
    path: '/sso-clients/:id',
    auth: true,
  },
  read: {
    method: 'GET',
    path: '/sso-clients/:id',
    auth: true,
  },
  secret: {
    create: {
      method: 'POST',
      path: '/sso-clients/:id/secret',
      auth: true,
    },
  },
};
