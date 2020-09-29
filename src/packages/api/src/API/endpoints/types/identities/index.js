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
  coupon: {
    add: {
      method: 'POST',
      path: '/identities/:id/coupons',
      auth: true,
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
};
