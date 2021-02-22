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
};
