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
