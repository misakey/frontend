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
    mailProvider: { _: '/account/mail-provider' },
    thirdParty: { setup: '/account/third-party/setup' },
  },
  admin: {
    _: '/admin',
    services: '/admin/services',
    service: {
      _: '/admin/:mainDomain',
      home: { _: '/admin/:mainDomain' },
      create: {
        _: '/admin/service/create',
        mainDomain: '/admin/service/create/:mainDomain',
      },
      list: { _: '/admin/service/list' },
      claim: { _: '/admin/:mainDomain/claim' },
      information: {
        _: '/admin/:mainDomain/information',
        name: '/admin/:mainDomain/information/name',
        logo: {
          _: '/admin/:mainDomain/information/logo',
          upload: '/admin/:mainDomain/information/logo/upload',
        },
        mainDomain: '/admin/:mainDomain/information/mainDomain',
        otherDomains: '/admin/:mainDomain/information/otherDomains',
        shortDesc: '/admin/:mainDomain/information/shortDesc',
        longDesc: '/admin/:mainDomain/information/longDesc',
      },
      sso: {
        _: '/admin/:mainDomain/sso',
        allowedOrigins: '/admin/:mainDomain/sso/allowedOrigins',
        redirectUri: '/admin/:mainDomain/sso/redirectUri',
        productionSetup: '/admin/:mainDomain/sso/productionSetup',
        customRoles: '/admin/:mainDomain/sso/customRoles',
      },
      users: {
        _: '/admin/:mainDomain/users',
        edit: '/admin/:mainDomain/users/edit',
      },
      data: { _: '/admin/:mainDomain/data' },
    },
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
  citizen: {
    _: '/citizen',
    applications: {
      _: '/citizen/applications',
      create: '/citizen/applications/create',
    },
    application: {
      _: '/citizen/:mainDomain',
      contact: {
        _: '/citizen/:mainDomain/contact',
        preview: '/citizen/:mainDomain/contact/:provider',
      },
      info: '/citizen/:mainDomain',
      comments: '/citizen/:mainDomain/comments',
      personalData: '/citizen/:mainDomain/personal-data',
      thirdParty: '/citizen/:mainDomain/third-party',
      myAccount: '/citizen/:mainDomain/my-account',
      feedback: {
        _: '/citizen/:mainDomain/feedback',
        others: '/citizen/:mainDomain/feedback/others',
        me: '/citizen/:mainDomain/feedback/me',
      },
    },
  },
  dpo: {
    _: '/dpo',
    service: {
      _: '/dpo/:mainDomain',
      claim: { _: '/dpo/:mainDomain/claim' },
      requests: {
        _: '/dpo/:mainDomain/requests',
        read: '/dpo/:mainDomain/requests/:databoxId',
      },
    },
  },
  legals: {
    privacy: '/legals/privacy',
    tos: '/legals/tos',
  },
  requests: '/requests',
  plugin: '/index.html',
  errors: {
    forbidden: '/errors/forbidden',
  },
};

export default routes;
