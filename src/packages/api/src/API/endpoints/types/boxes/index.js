export default {
  find: {
    method: 'GET',
    path: '/boxes',
    auth: true,
  },
  read: {
    method: 'GET',
    path: '/boxes/:id',
    auth: true,
  },
  create: {
    method: 'POST',
    path: '/boxes',
    auth: true,
  },
  count: {
    method: 'HEAD',
    path: '/boxes',
    auth: true,
  },
  delete: {
    method: 'DELETE',
    path: '/boxes/:id',
    auth: true,
  },
  user: {
    find: {
      METHOD: 'GET',
      path: '/boxes/joined',
      auth: true,
    },
    count: {
      method: 'HEAD',
      path: '/boxes/joined',
      auth: true,
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
      auth: true,
    },
  },
  events: {
    newCount: {
      update: {
        method: 'PUT',
        path: '/boxes/:id/new-events-count/ack',
        auth: true,
      },
    },
    find: {
      method: 'GET',
      path: '/boxes/:id/events',
      auth: true,
    },
    count: {
      method: 'HEAD',
      path: '/boxes/:id/events',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/boxes/:id/events',
      auth: true,
    },
  },
  members: {
    find: {
      method: 'GET',
      path: '/boxes/:id/members',
      auth: true,
    },
  },
  encryptedFiles: {
    create: {
      method: 'POST',
      path: '/boxes/:id/encrypted-files',
      auth: true,
    },
  },
  keyShares: {
    create: {
      method: 'POST',
      path: '/box-key-shares',
      auth: true,
    },
    read: {
      method: 'GET',
      path: '/box-key-shares/:otherShareHash',
      auth: true,
    },
  },
  accesses: {
    find: {
      method: 'GET',
      path: '/boxes/:id/accesses',
      auth: true,
    },
  },
};
