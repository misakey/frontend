export default {
  read: {
    method: 'GET',
    path: '/users/:id',
  },
  update: {
    method: 'PATCH',
    path: '/users/:id',
    withCsrfToken: true,
  },
  delete: {
    method: 'DELETE',
    path: '/users/:id',
    withCsrfToken: true,
  },
  backupKeyShares: {
    read: {
      method: 'GET',
      path: '/backup-key-shares/:otherShareHash',
    },
    create: {
      method: 'POST',
      path: '/backup-key-shares',
      withCsrfToken: true,
    },
  },
  vault: {
    files: {
      count: {
        method: 'HEAD',
        path: '/saved-files',
      },
      read: {
        method: 'GET',
        path: '/saved-files',
      },
      create: {
        method: 'POST',
        path: '/saved-files',
        withCsrfToken: true,
      },
      delete: {
        method: 'DELETE',
        path: '/saved-files/:id',
        withCsrfToken: true,
      },
    },
  },
  public: {
    read: {
      method: 'GET',
      path: '/users/:email/public',
    },
  },
};
