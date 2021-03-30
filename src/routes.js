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
  documents: {
    _: '/documents',
  },
  organizations: {
    _: '/organizations',
    secret: '/organizations/secret',
    agents: '/organizations/agents',
  },
};

export default routes;
