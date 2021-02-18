export default {
  read: {
    method: 'GET',
    path: '/identities/:id',
  },
  update: {
    method: 'PATCH',
    path: '/identities/:id',
    withCsrfToken: true,
  },
  avatar: {
    update: {
      method: 'PUT',
      path: '/identities/:id/avatar',
      withCsrfToken: true,
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
      },
      update: {
        method: 'PATCH',
        path: '/identities/:id/profile/config',
        withCsrfToken: true,
      },
    },
  },
  webauthnCredentials: {
    read: {
      method: 'GET',
      path: '/identities/:id/webauthn-credentials/create',
    },
    create: {
      method: 'POST',
      path: '/identities/:id/webauthn-credentials/create',
      withCsrfToken: true,
    },
    find: {
      method: 'GET',
      path: '/webauthn-credentials',
    },
    delete: {
      method: 'DELETE',
      path: '/webauthn-credentials/:id',
      withCsrfToken: true,
    },
  },
  totp: {
    read: {
      method: 'GET',
      path: '/identities/:id/totp/enroll',
    },
    create: {
      method: 'POST',
      path: '/identities/:id/totp/enroll',
      withCsrfToken: true,
    },
    delete: {
      method: 'DELETE',
      path: '/identities/:id/totp',
      withCsrfToken: true,
    },
    recoveryCodes: {
      create: {
        method: 'POST',
        path: '/identities/:id/totp/recovery-codes',
        withCsrfToken: true,
      },
    },
  },
  storageQuota: {
    find: {
      method: 'GET',
      path: '/box-users/:id/storage-quota',
    },
  },
  boxUsedSpaces: {
    find: {
      method: 'GET',
      path: '/box-used-spaces',
    },
  },
  vaultUsedSpace: {
    read: {
      method: 'GET',
      path: '/box-users/:id/vault-used-space',
    },
  },
  boxSettings: {
    update: {
      method: 'PUT',
      path: '/box-users/:identityId/boxes/:boxId/settings',
      withCsrfToken: true,
    },
  },
  notifications: {
    find: {
      method: 'GET',
      path: '/identities/:id/notifications',
    },
    count: {
      method: 'HEAD',
      path: '/identities/:id/notifications',
    },
    update: {
      method: 'PUT',
      path: '/identities/:id/notifications/acknowledgement',
      withCsrfToken: true,
    },
  },
  organizations: {
    find: {
      method: 'GET',
      path: '/identities/:id/organizations',
      withCsrfToken: true,
    },
  },
  vault: {
    create: {
      method: 'POST',
      path: '/box-users/:identityId/saved-files',
      withCsrfToken: true,
    },
  },
  contact: {
    create: {
      method: 'POST',
      path: '/box-users/:identityId/contact',
      auth: true,
      withCsrfToken: true,
    },
  },
};
