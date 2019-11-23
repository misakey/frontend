import { mergeArrays, filterAppsBy, markAsFetched } from './utils';

test('test mergeArrays', () => {
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
  ];


  expect(mergeArrays(appFromPlugin, arrayFromApi, 'mainDomain')).toEqual(
    [
      {
        id: 'ib.adnxs.com',
        name: 'adnxs',
        mainDomain: 'ib.adnxs.com',
        mainPurpose: 'other',
      },
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
