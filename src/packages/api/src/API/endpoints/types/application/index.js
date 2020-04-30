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
    search: {
      method: 'GET',
      path: '/application-info/search',
      auth: true,
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
