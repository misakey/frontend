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
  avatar: {
    update: {
      method: 'PUT',
      path: '/users/:id/avatar',
      auth: true,
    },
  },
  password: {
    update: {
      method: 'PUT',
      path: '/users/password',
      auth: true,
    },
    askReset: {
      method: 'POST',
      path: '/users/password/reset',
      auth: true,
      innerRules: {
        naming: 'permissive',
      },
    },
    confirmCode: {
      method: 'POST',
      path: '/users/password/otp/confirm',
      auth: true,
      innerRules: {
        naming: 'permissive',
      },
    },
    reset: {
      method: 'PUT',
      path: '/users/password/reset',
      auth: true,
      innerRules: {
        naming: 'permissive',
      },
    },
  },
  getSecretBackup: {
    method: 'GET',
    path: '/users/:id/backup',
    auth: true,
    innerRules: {
      naming: 'permissive',
    },
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
  roles: {
    read: {
      method: 'GET',
      path: '/user-roles',
      auth: true,
    },
  },
};
