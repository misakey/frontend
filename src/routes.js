// routes.example._ stands for routes.example.exact

const routes = {
  _: '/',
  auth: {
    _: '/auth',
    callback: '/callback',
    signOut: '/logout',
  },
  service: {
    claim: {
      _: '/service/claim',
      mainDomain: '/service/claim/:mainDomain',
    },
    create: {
      _: '/service/create',
      mainDomain: '/service/create/:mainDomain',
    },
    list: '/service/list',
    home: '/:mainDomain',
    details: {
      _: '/:mainDomain/details',
      edit: '/:mainDomain/details/edit',
    },
    sso: {
      _: '/:mainDomain/sso',
      edit: '/:mainDomain/sso/edit',
    },
    users: {
      _: '/:mainDomain/users',
      edit: '/:mainDomain/users/edit',
    },
    data: '/:mainDomain/data',
    requests: '/:mainDomain/requests',
  },
};

export default routes;
