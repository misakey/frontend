export default {
  find: {
    method: 'GET',
    path: '/boxes',
  },
  read: {
    method: 'GET',
    path: '/boxes/:id',
  },
  create: {
    method: 'POST',
    path: '/boxes',
    withCsrfToken: true,
  },
  count: {
    method: 'HEAD',
    path: '/boxes',
  },
  delete: {
    method: 'DELETE',
    path: '/boxes/:id',
    withCsrfToken: true,
  },
  user: {
    find: {
      METHOD: 'GET',
      path: '/boxes/joined',
    },
    count: {
      method: 'HEAD',
      path: '/boxes/joined',
    },
  },
  public: {
    read: {
      method: 'GET',
      path: '/boxes/:id/public',
    },
  },
  bulkEvents: {
    create: {
      method: 'POST',
      path: '/boxes/:id/batch-events',
      withCsrfToken: true,
    },
  },
  events: {
    newCount: {
      update: {
        method: 'PUT',
        path: '/boxes/:id/new-events-count/ack',
      },
    },
    find: {
      method: 'GET',
      path: '/boxes/:id/events',
    },
    count: {
      method: 'HEAD',
      path: '/boxes/:id/events',
    },
    create: {
      method: 'POST',
      path: '/boxes/:id/events',
      withCsrfToken: true,
    },
    files: {
      find: {
        method: 'GET',
        path: '/boxes/:id/files',
      },
      count: {
        method: 'HEAD',
        path: '/boxes/:id/files',
      },
    },
  },
  members: {
    find: {
      method: 'GET',
      path: '/boxes/:id/members',
    },
  },
  encryptedFiles: {
    create: {
      method: 'POST',
      path: '/boxes/:id/encrypted-files',
      withCsrfToken: true,
    },
  },
  keyShares: {
    read: {
      method: 'GET',
      path: '/box-key-shares/:invitationShareHash',
    },
  },
  accesses: {
    find: {
      method: 'GET',
      path: '/boxes/:id/accesses',
    },
  },
};
