export default {
  create: {
    method: 'POST',
    path: '/organizations',
    withCsrfToken: true,
  },
  public: {
    read: {
      method: 'GET',
      path: '/organizations/:id/public',
    },
  },
  secret: {
    create: {
      method: 'PUT',
      path: '/organizations/:id/secret',
      withCsrfToken: true,
    },
  },
};
