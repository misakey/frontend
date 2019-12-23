export default {
  find: {
    method: 'GET',
    path: '/application-info',
  },
  read: {
    method: 'GET',
    path: '/applications/:mainDomain',
    auth: true,
  },
  update: {
    method: 'PUT',
    path: '/applications/:id',
    auth: true,
  },
  info: {
    find: {
      method: 'GET',
      path: '/application-info',
    },
    read: {
      method: 'GET',
      path: '/application-info/:id',
    },
    update: {
      method: 'PATCH',
      path: '/application-info/:id',
      auth: true,
    },
    logo: {
      update: {
        method: 'PUT',
        path: '/application-info/:id/logo',
        auth: true,
      },
      delete: {
        method: 'DELETE',
        path: '/application-info/:id/logo',
        auth: true,
      },
    },
  },
  domains: {
    find: {
      method: 'GET',
      path: '/domains',
      auth: true,
    },
  },
  box: {
    find: {
      method: 'GET',
      path: '/databoxes',
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
    },
  },
  claim: {
    find: {
      method: 'GET',
      path: '/application-claims',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/application-claims',
      auth: true,
    },
    verify: {
      update: {
        method: 'PATCH',
        path: '/application-claims/:id',
        auth: true,
      },
    },
  },
};
