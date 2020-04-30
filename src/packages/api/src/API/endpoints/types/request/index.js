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
  requestAccess: {
    method: 'GET',
    path: '/databoxes/:id/access-request',
    auth: true,
    innerRules: {
      naming: 'permissive',
    },
  },
  create: {
    method: 'POST',
    path: '/databoxes',
    auth: true,
  },
  update: {
    method: 'PATCH',
    path: '/databoxes/:id',
    auth: true,
  },
  delete: {
    method: 'DELETE',
    path: '/databoxes/:id',
    auth: true,
  },
  count: {
    method: 'HEAD',
    path: '/databoxes',
    auth: true,
  },
  logs: {
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