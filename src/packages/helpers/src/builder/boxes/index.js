/* eslint-disable no-unused-vars */
import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
// API
//   .use(API.endpoints.boxes.read)
//   .build({ id }, body, objectToSnakeCase(queryParams))
//   .send()
export const getBoxBuilder = (id, body, queryParams = {}) => Promise.resolve({
  id: '3f6e6610-7880-46b6-bc3b-56c21bfb6392',
  ownerId: '43cad6b7-62f9-405c-8a38-1db1c1db41be',
  status: 'open',
  createdAt: '2020-05-07T14:40:55.08361Z',
  updatedAt: '2020-05-07T14:40:55.08361Z',
  purpose: 'unknown',
  title: 'Ma box',
  events: [
    {
      id: '6e69788f-b1db-4278-8153-6334a2f5c109',
      type: 'create',
      serverTimestamp: '2020-05-05T14:05:42.609114Z',
      content: {
        title: 'Ma box',
        publicKey: '',
      },
      sender: {
        displayName: 'claire',
        avatarUri: '',
      },
    },
    {
      id: '413e8c3d-b59a-4964-8fbb-16729f5d48cd',
      type: 'msg.txt',
      serverTimestamp: '2020-05-05T14:15:42.609114Z',
      content: {
        encrypted: 'Ma box',
        recipientPublicKey: '',
      },
      sender: {
        displayName: 'claire',
        avatarUri: '',
      },
    },
    {
      id: 'ae5f7d8e-057b-407c-9d60-1d7f4f7e2074',
      type: 'msg.txt',
      serverTimestamp: '2020-05-05T14:08:42.609114Z',
      content: {
        encrypted: 'Ma box',
        recipientPublicKey: '',
      },
      sender: {
        displayName: 'claire',
        avatarUri: '',
      },
    },
  ],
})
  .then((response) => objectToCamelCaseDeep({
    // @FIXME: keep only response when endpoints will exist
    ...response,
    title: response.type,
    purpose: response.type,
  }));

// API
//   .use(API.endpoints.boxes.events.find)
//   .build(null, null, objectToSnakeCase({ databoxId: id }))
//   .send()
export const getBoxEventsBuilder = (id) => Promise.resolve([
  {
    id: '6e69788f-b1db-4278-8153-6334a2f5c109',
    type: 'create',
    serverTimestamp: '2020-05-05T14:05:42.609114Z',
    content: {
      title: 'Ma box',
      publicKey: '',
    },
    sender: {
      displayName: 'claire',
      avatarUri: '',
    },
  },
  {
    id: '413e8c3d-b59a-4964-8fbb-16729f5d48cd',
    type: 'msg.txt',
    serverTimestamp: '2020-05-05T14:15:42.609114Z',
    content: {
      encrypted: 'Ma box',
      recipientPublicKey: '',
    },
    sender: {
      displayName: 'claire',
      avatarUri: '',
    },
  },
  {
    id: 'ae5f7d8e-057b-407c-9d60-1d7f4f7e2074',
    type: 'msg.txt',
    serverTimestamp: '2020-05-05T14:08:42.609114Z',
    content: {
      encrypted: 'Ma box',
      recipientPublicKey: '',
    },
    sender: {
      displayName: 'claire',
      avatarUri: '',
    },
  },
])
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
export const getUserBoxesBuilder = (payload) => Promise.resolve([
  {
    id: '3f6e6610-7880-46b6-bc3b-56c21bfb6392',
    ownerId: '43cad6b7-62f9-405c-8a38-1db1c1db41be',
    status: 'open',
    createdAt: '2020-05-07T14:40:55.08361Z',
    updatedAt: '2020-05-07T14:40:55.08361Z',
    purpose: 'unknown',
    title: 'Ma box',
    events: [
      {
        id: '6e69788f-b1db-4278-8153-6334a2f5c109',
        type: 'create',
        serverTimestamp: '2020-05-05T14:05:42.609114Z',
        content: {
          title: 'Ma box',
          publicKey: '',
        },
        sender: {
          displayName: 'claire',
          avatarUri: '',
        },
      },
      {
        id: '413e8c3d-b59a-4964-8fbb-16729f5d48cd',
        type: 'msg.txt',
        serverTimestamp: '2020-05-05T14:15:42.609114Z',
        content: {
          encrypted: 'Ma box',
          recipientPublicKey: '',
        },
        sender: {
          displayName: 'claire',
          avatarUri: '',
        },
      },
      {
        id: 'ae5f7d8e-057b-407c-9d60-1d7f4f7e2074',
        type: 'msg.txt',
        serverTimestamp: '2020-05-05T14:08:42.609114Z',
        content: {
          encrypted: 'Ma box',
          recipientPublicKey: '',
        },
        sender: {
          displayName: 'claire',
          avatarUri: '',
        },
      },
    ],
  },
  {
    id: '9b27cdcb-89f7-4f8a-8310-35a35c2b64a8',
    ownerId: '43cad6b7-62f9-405c-8a38-1db1c1db41be',
    status: 'open',
    title: 'Ma box 2',
    createdAt: '2020-05-07T14:40:40.544907Z',
    updatedAt: '2020-05-07T14:40:40.544907Z',
    purpose: 'unknown',
    events: [{
      id: 'a7201b2b-a0b7-482b-92c4-ffd29df71511',
      type: 'create',
      serverTimestamp: '2020-05-05T15:05:42.609114Z',
      content: {
        title: 'Ma deuxième box',
        publicKey: '',
      },
      sender: {
        displayName: 'claire',
        avatarUri: '',
      },
    }],
  },
]);

// eslint-disable-next-line arrow-body-style
export const countUserBoxesBuilder = (payload) => {
  // const query = isNil(payload) ? {} : objectToSnakeCase(payload);
  return Promise.resolve(2);
  // return API
  //   .use(API.endpoints.boxes.count)
  //   .build(null, null, query)
  //   .send()
  //   .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));
};
