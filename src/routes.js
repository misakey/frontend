const routes = {
  _: '/',
  account: {
    _: '/account',
    profile: {
      avatar: {
        _: '/account/profile/avatar',
        upload: '/account/profile/avatar/upload',
      },
      name: '/account/profile/name',
      password: '/account/profile/password',
    },
    mailProvider: {
      _: '/account/mail-provider',
    },
    thirdParty: {
      setup: '/account/third-party/setup',
    },
  },
  application: {
    _: '/',
    info: '/:mainDomain',
    comments: '/:mainDomain/comments',
    personalData: '/:mainDomain/personal-data',
    thirdParty: '/:mainDomain/third-party',
    myAccount: '/:mainDomain/my-account',
  },
  auth: {
    _: '/auth',
    callback: '/callback',
    error: '/auth/error',
    recover: '/auth/recover',
    signIn: '/auth/login',
    signOut: '/logout',
    signUp: {
      _: '/auth/register',
      confirm: '/auth/register/confirm',
    },
    forgotPassword: '/auth/password/forgot',
  },
  contact: {
    _: '/contact/:mainDomain',
    preview: '/contact/:mainDomain/:provider',
  },
  landing: '/welcome',
  legals: {
    privacy: '/legals/privacy',
    tos: '/legals/tos',
  },
  plugin: '/index.html',
  service: {
    _: '/:mainDomain',
    create: {
      _: '/service/create',
      mainDomain: '/service/create/:mainDomain',
    },
    list: '/service/list',
    claim: {
      _: '/:mainDomain/claim',
    },
    home: {
      _: '/:mainDomain',
    },
    information: {
      _: '/:mainDomain/information',
      name: '/:mainDomain/information/name',
      logo: {
        _: '/:mainDomain/information/logo',
        upload: '/:mainDomain/information/logo/upload',
      },
      mainDomain: '/:mainDomain/information/mainDomain',
      otherDomains: '/:mainDomain/information/otherDomains',
      shortDesc: '/:mainDomain/information/shortDesc',
      longDesc: '/:mainDomain/information/longDesc',
    },
    role: {
      claim: {
        _: '/:mainDomain/dpo/claim', // '/:mainDomain/:role/claim'
      },
    },
    sso: {
      _: '/:mainDomain/sso',
      allowedOrigins: '/:mainDomain/sso/allowedOrigins',
      redirectUri: '/:mainDomain/sso/redirectUri',
      productionSetup: '/:mainDomain/sso/productionSetup',
      customRoles: '/:mainDomain/sso/customRoles',
    },
    users: {
      _: '/:mainDomain/users',
      edit: '/:mainDomain/users/edit',
    },
    data: {
      _: '/:mainDomain/data',
    },
    requests: {
      _: '/:mainDomain/requests',
      read: '/:mainDomain/requests/:databoxId',
    },
  },
  requests: {
    _: '/requests',
  },
};

export default routes;
