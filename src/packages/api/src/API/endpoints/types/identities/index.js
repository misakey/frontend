export default {
  checkAuthable: {
    method: 'PUT',
    path: '/identities/authable',
  },
  read: {
    method: 'GET',
    path: '/identities/:id',
    auth: true,
  },
  update: {
    method: 'PATCH',
    path: '/identities/:id',
    auth: true,
  },
  avatar: {
    update: {
      method: 'PUT',
      path: '/identities/:id/avatar',
      auth: true,
    },
  },
  profile: {
    read: {
      method: 'GET',
      path: '/identities/:id/profile',
    },
    config: {
      read: {
        method: 'GET',
        path: '/identities/:id/profile/config',
        auth: true,
      },
      update: {
        method: 'PATCH',
        path: '/identities/:id/profile/config',
        auth: true,
      },
    },
  },
  storageQuota: {
    find: {
      method: 'GET',
      path: '/box-users/:id/storage-quota',
      auth: true,
    },
  },
  boxUsedSpaces: {
    find: {
      method: 'GET',
      path: '/box-used-spaces',
      auth: true,
    },
  },
  vaultUsedSpace: {
    read: {
      method: 'GET',
      path: '/box-users/:id/vault-used-space',
      auth: true,
    },
  },
  boxSettings: {
    update: {
      method: 'PUT',
      path: '/box-users/:identityId/boxes/:boxId/settings',
      auth: true,
    },
  },
};
