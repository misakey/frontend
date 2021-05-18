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
  crypto: {
    create: {
      method: 'PUT',
      path: '/organizations/:id/crypto',
      withCsrfToken: true,
    },
  },
  agents: {
    count: {
      method: 'HEAD',
      path: '/organizations/:id/agents',
    },
    find: {
      method: 'GET',
      path: '/organizations/:id/agents',
    },
    create: {
      method: 'POST',
      path: '/organizations/:id/agents',
      withCsrfToken: true,
    },
  },
};
