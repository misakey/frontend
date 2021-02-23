const routes = {
  _: '/',
  boxes: {
    _: '/boxes',
    read: {
      _: '/boxes/:id',
      details: '/boxes/:id/details',
      sharing: '/boxes/:id/sharing',
      files: '/boxes/:id/files',
    },
    invitation: '/invitation',
  },
  identities: {
    _: '/identities/:id',
    avatar: {
      _: '/identities/:id/avatar',
      upload: '/identities/:id/avatar/upload',
    },
    displayName: '/identities/:id/displayName',
    public: '/identities/:id/public',
    notifications: '/identities/:id/notifications',
    colors: '/identities/:id/colors',
    accounts: {
      _: '/identities/:id/accounts/:accountId',
      security: '/identities/:id/accounts/:accountId/security',
      vault: '/identities/:id/accounts/:accountId/vault',
      delete: '/identities/:id/accounts/:accountId/delete',
    },
  },
  documents: {
    _: '/documents',
  },
  organizations: {
    _: '/organizations',
    secret: '/organizations/secret',
  },
  userNotifications: {
    _: '/user-notifications',
  },
  account: {
    _: '/account',
    mailProvider: { _: '/account/mail-provider' },
    thirdParty: { setup: '/account/third-party/setup' },
  },
};

export default routes;
