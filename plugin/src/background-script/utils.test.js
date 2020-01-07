import { assignApiInfo, filterAppsBy, markAsFetched } from './utils';

test('test assignApiInfo', () => {
  const arrayFromApi = [
    {
      id: '85fc2884-7888-451d-bd0f-2b699117cf04',
      name: 'Criteo',
      mainDomain: 'static.criteo.net',
      logoUri: 'https://logoofcriteao.net',
      shortDesc: null,
      claimed: false,
      isThirdParty: true,
      mainPurpose: 'advertising',
      published: true,
    },
    {
      id: '5b16a461-c3c9-4da8-a025-c16627c8a089',
      name: 'Newrelic',
      mainDomain: 'js-agent.newrelic.com',
      logoUri: null,
      shortDesc: null,
      claimed: false,
      isThirdParty: true,
      mainPurpose: '',
      published: true,
    },
    {
      id: '204e276f-74fe-487c-8b06-8f096161de6b',
      name: 'ACPM',
      mainDomain: 'acpm.fr',
      logoUri: null,
      shortDesc: null,
      claimed: false,
      isThirdParty: true,
      mainPurpose: 'analytics',
      published: true,
    },
  ];

  const appFromPlugin = [
    {
      id: 'ib.adnxs.com',
      name: 'adnxs',
      mainDomain: 'ib.adnxs.com',
      mainPurpose: 'other',
    },
    {
      id: 'static.criteo.net',
      name: 'criteo',
      mainDomain: 'static.criteo.net',
      mainPurpose: 'advertising',
      additionalKey: 'test',
    },
    {
      id: 'js-agent.newrelic.com',
      name: 'newrelic',
      mainDomain: 'js-agent.newrelic.com',
      mainPurpose: 'analytics',
    },
    {
      id: 'collecte.audience.acpm.fr',
      name: 'collecte audience acp',
      mainDomain: 'collecte.audience.acpm.fr',
      mainPurpose: 'advertising',
    },
    {
      id: 'auth.audience.acpm.fr',
      name: 'auth audience acp',
      mainDomain: 'auth.audience.acpm.fr',
      mainPurpose: 'analytics',
    },
    {
      id: 'fake-acpm.fr',
      name: 'Fake Acpm',
      mainDomain: 'fake-acpm.fr',
      mainPurpose: 'advertising',
    },
    {
      id: 'acpm.fr',
      name: 'Acpm',
      mainDomain: 'acpm.fr',
      mainPurpose: 'advertising',
    },
  ];

  expect(assignApiInfo(appFromPlugin, arrayFromApi)).toEqual(
    [
      {
        id: '85fc2884-7888-451d-bd0f-2b699117cf04',
        name: 'Criteo',
        mainDomain: 'static.criteo.net',
        logoUri: 'https://logoofcriteao.net',
        shortDesc: null,
        claimed: false,
        isThirdParty: true,
        mainPurpose: 'advertising',
        published: true,
        additionalKey: 'test',
      },
      {
        id: '5b16a461-c3c9-4da8-a025-c16627c8a089',
        name: 'Newrelic',
        mainDomain: 'js-agent.newrelic.com',
        logoUri: null,
        shortDesc: null,
        claimed: false,
        isThirdParty: true,
        mainPurpose: 'analytics',
        published: true,
      },
      {
        id: '204e276f-74fe-487c-8b06-8f096161de6b',
        name: 'ACPM',
        mainDomain: 'collecte.audience.acpm.fr',
        logoUri: null,
        shortDesc: null,
        claimed: false,
        isThirdParty: true,
        mainPurpose: 'analytics',
        published: true,
      },
      {
        id: '204e276f-74fe-487c-8b06-8f096161de6b',
        name: 'ACPM',
        mainDomain: 'auth.audience.acpm.fr',
        logoUri: null,
        shortDesc: null,
        claimed: false,
        isThirdParty: true,
        mainPurpose: 'analytics',
        published: true,
      },
      {
        id: '204e276f-74fe-487c-8b06-8f096161de6b',
        name: 'ACPM',
        mainDomain: 'acpm.fr',
        logoUri: null,
        shortDesc: null,
        claimed: false,
        isThirdParty: true,
        mainPurpose: 'analytics',
        published: true,
      },
      {
        id: 'ib.adnxs.com',
        name: 'adnxs',
        mainDomain: 'ib.adnxs.com',
        mainPurpose: 'other',
      },
      {
        id: 'fake-acpm.fr',
        name: 'Fake Acpm',
        mainDomain: 'fake-acpm.fr',
        mainPurpose: 'advertising',
      },
    ],
  );
});


test('test filterAppsBy ', () => {
  const apps = [
    {
      id: 'ib.adnxs.com',
      name: 'adnxs',
      mainDomain: 'ib.adnxs.com',
      mainPurpose: 'other',
    },
    {
      id: 'static.criteo.net',
      name: 'criteo',
      mainDomain: 'static.criteo.net',
      mainPurpose: 'advertising',
      additionalKey: 'test',
    },
    {
      id: 'bidder.criteo.net',
      name: 'criteo',
      mainDomain: 'bidder.criteo.net',
      mainPurpose: 'analytics',
    },
    {
      id: 'js-agent.newrelic.com',
      name: 'newrelic',
      mainDomain: 'js-agent.newrelic.com',
      mainPurpose: 'analytics',
    },
  ];


  expect(filterAppsBy(null, null, apps)).toEqual(apps);
  expect(filterAppsBy('cri', null, apps)).toEqual([
    {
      id: 'static.criteo.net',
      name: 'criteo',
      mainDomain: 'static.criteo.net',
      mainPurpose: 'advertising',
      additionalKey: 'test',
    },
    {
      id: 'bidder.criteo.net',
      name: 'criteo',
      mainDomain: 'bidder.criteo.net',
      mainPurpose: 'analytics',
    },
  ]);

  expect(filterAppsBy('cri', 'analytics', apps)).toEqual([
    {
      id: 'bidder.criteo.net',
      name: 'criteo',
      mainDomain: 'bidder.criteo.net',
      mainPurpose: 'analytics',
    },
  ]);
});

test('test markAsFetched', () => {
  const appFromPlugin = [
    {
      id: 'ib.adnxs.com',
      name: 'adnxs',
      mainDomain: 'ib.adnxs.com',
      mainPurpose: 'other',
    },
    {
      id: 'static.criteo.net',
      name: 'criteo',
      mainDomain: 'static.criteo.net',
      mainPurpose: 'advertising',
      additionalKey: 'test',
    },
    {
      id: 'js-agent.newrelic.com',
      name: 'newrelic',
      mainDomain: 'js-agent.newrelic.com',
      mainPurpose: 'analytics',
    },
  ];


  expect(markAsFetched(appFromPlugin, ['ib.adnxs.com', 'static.criteo.net'])).toEqual(
    [
      {
        id: 'ib.adnxs.com',
        name: 'adnxs',
        mainDomain: 'ib.adnxs.com',
        mainPurpose: 'other',
        fetched: true,
      },
      {
        id: 'static.criteo.net',
        name: 'criteo',
        mainDomain: 'static.criteo.net',
        mainPurpose: 'advertising',
        additionalKey: 'test',
        fetched: true,
      },
      {
        id: 'js-agent.newrelic.com',
        name: 'newrelic',
        mainDomain: 'js-agent.newrelic.com',
        mainPurpose: 'analytics',
      },
    ],
  );
});
