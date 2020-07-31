export default {
  read: {
    method: 'GET',
    path: '/users/:id',
    auth: true,
  },
  update: {
    method: 'PATCH',
    path: '/users/:id',
    auth: true,
  },
  delete: {
    method: 'DELETE',
    path: '/users/:id',
    auth: true,
  },
  backupKeyShares: {
    read: {
      method: 'GET',
      path: '/backup-key-shares/:otherShareHash',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/backup-key-shares',
      auth: true,
    },
  },
  public: {
    read: {
      method: 'GET',
      path: '/users/:email/public',
    },
  },
};
