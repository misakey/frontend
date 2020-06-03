export default {
  find: {
    method: 'GET',
    path: '/databoxes',
    auth: true,
  },
  read: {
    method: 'GET',
    path: '/databoxes/:id',
    auth: true,
  },
  create: {
    method: 'POST',
    path: '/databoxes',
    auth: true,
  },
  count: {
    method: 'HEAD',
    path: '/databoxes',
    auth: true,
  },
  events: {
    find: {
      method: 'GET',
      path: '/databox-logs',
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
