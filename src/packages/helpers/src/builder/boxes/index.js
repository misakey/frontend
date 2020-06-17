import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const getBoxBuilder = (id, body, queryParams = {}) => API
  .use(API.endpoints.boxes.read)
  .build({ id }, body, objectToSnakeCase(queryParams))
  .send()
  .then(objectToCamelCase);

export const getBoxEventsBuilder = (id) => API
  .use(API.endpoints.boxes.events.find)
  .build({ id })
  .send()
  .then((events) => events.map(objectToCamelCaseDeep));

export const getBoxWithEventsBuilder = (id) => Promise.all([
  getBoxBuilder(id),
  getBoxEventsBuilder(id),
])
  .then(([box, events]) => ({
    ...box,
    events,
  }));

// API
// .use(API.endpoints.boxes.find)
// .build(null, null, objectToSnakeCase({
//   withBlobCount: true,
//   orderBy: 'updated_at DESC',
//   ...payload,
// }))
// .send()
// eslint-disable-next-line no-unused-vars
export const getUserBoxesBuilder = (payload) => Promise.resolve([
  {
    id: '3f6e6610-7880-46b6-bc3b-56c21bfb6392',
    ownerId: '43cad6b7-62f9-405c-8a38-1db1c1db41be',
    status: 'open',
    serverCreatedAt: '2020-05-07T14:40:55.08361Z',
    updatedAt: '2020-05-07T14:40:55.08361Z',
    title: 'Dossier de location - Michel et Odile',
    events: [
      {
        id: '6e69788f-b1db-4278-8153-6334a2f5c109',
        type: 'create',
        serverEventCreatedAt: '2020-05-05T14:05:42.609114Z',
        content: {
          title: 'Ma box',
          publicKey: '',
        },
        sender: {
          displayName: 'claire',
          avatarUri: '',
          identifier: {
            kind: 'email',
            value: 'claire.dhenin@misakey.com',
          },
        },
      },
      {
        id: '413e8c3d-b59a-4964-8fbb-16729f5d48cd',
        type: 'msg.text',
        serverEventCreatedAt: '2020-05-05T14:15:42.609114Z',
        content: {
          encrypted: btoa('Ma box'),
          recipientPublicKey: '',
        },
        sender: {
          displayName: 'claire',
          avatarUri: '',
          identifier: {
            kind: 'email',
            value: 'claire.dhenin@misakey.com',
          },
        },
      },
      {
        id: 'ae5f7d8e-057b-407c-9d60-1d7f4f7e2074',
        type: 'msg.text',
        serverEventCreatedAt: '2020-05-05T14:08:42.609114Z',
        content: {
          encrypted: btoa('Ma box'),
          recipientPublicKey: '',
        },
        sender: {
          displayName: 'claire',
          avatarUri: '',
          identifier: {
            kind: 'email',
            value: 'claire.dhenin@misakey.com',
          },
        },
      },
    ],
  },
  {
    id: '9b27cdcb-89f7-4f8a-8310-35a35c2b64a8',
    ownerId: '43cad6b7-62f9-405c-8a38-1db1c1db41be',
    status: 'open',
    title: 'Contrat à durée indéterminé',
    serverCreatedAt: '2020-05-07T14:40:40.544907Z',
    updatedAt: '2020-05-07T14:40:40.544907Z',
    events: [{
      id: 'a7201b2b-a0b7-482b-92c4-ffd29df71511',
      type: 'create',
      serverEventCreatedAt: '2020-05-05T15:05:42.609114Z',
      content: {
        title: 'Contrat à durée indéterminé',
        publicKey: '',
      },
      sender: {
        displayName: 'claire',
        avatarUri: '',
        identifier: {
          kind: 'email',
          value: 'claire.dhenin@misakey.com',
        },
      },
    }],
  },
]);

// eslint-disable-next-line arrow-body-style, no-unused-vars
export const countUserBoxesBuilder = (payload) => {
  // const query = isNil(payload) ? {} : objectToSnakeCase(payload);
  return Promise.resolve(2);
  // return API
  //   .use(API.endpoints.boxes.count)
  //   .build(null, null, query)
  //   .send()
  //   .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));
};

export const createBoxBuilder = (payload) => API
  .use(API.endpoints.boxes.create)
  .build(null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCaseDeep);

export const createBoxEventBuilder = (id, payload) => API
  .use(API.endpoints.boxes.events.create)
  .build({ id }, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCaseDeep);
