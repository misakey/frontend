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
  events: {
    find: {
      method: 'GET',
      path: '/boxes/:id/events',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/boxes/:id/events',
      auth: true,
    },
  },
  encryptedFiles: {
    create: {
      method: 'POST',
      path: '/boxes/:id/encrypted-files',
      auth: true,
    },
    read: {
      method: 'GET',
      path: '/boxes/:id/encrypted-files/:fileId',
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
  // @FIXME is this still used at all?
  blob: {
    find: {
      method: 'GET',
      path: '/blobs',
      auth: true,
    },
    read: {
      method: 'GET',
      path: '/blobs/:id',
      auth: true,
    },
    create: {
      method: 'PUT',
      path: '/blobs',
      auth: true,
    },
    count: {
      method: 'HEAD',
      path: '/blobs',
      auth: true,
    },
  },
};
