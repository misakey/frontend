export default {
  checkAuthable: {
    method: 'PUT',
    path: '/identities/authable',
  },
  read: {
    method: 'GET',
    path: '/identities/:id',
    auth: true,
  },
  account: {
    create: {
      method: 'POST',
      path: '/identities/:id/account',
      auth: true,
    },
  },
};
