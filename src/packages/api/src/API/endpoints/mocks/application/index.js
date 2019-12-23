import Mock from '@misakey/api/Mock';

import json200 from './200.json';

export default {
  find: new Mock({
    200: (resolve) => {
      const rawResponse = { status: 200 };

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      rawResponse.headers = headers;

      // eslint-disable-next-line no-shadow
      rawResponse.json = () => new Promise((resolve) => resolve(json200));

      return resolve(rawResponse);
    },
    401: (resolve) => {
      const rawResponse = { status: 401 };

      const headers = new Headers();
      headers.set('Content-Type', 'text/html');
      rawResponse.headers = headers;

      return resolve(rawResponse);
    },
    500: (resolve) => {
      const rawResponse = { status: 500 };

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      rawResponse.headers = headers;

      // eslint-disable-next-line no-shadow
      rawResponse.json = () => new Promise((resolve) => resolve({
        code: '{Code}',
        desc: 'free format description',
        origin: '{Origin}',
        details: {
          '{DetailKey1}': '{DetailValue}',
          '{DetailKey2}': '{DetailValue}',
        },
      }));

      return resolve(rawResponse);
    },
  }),
};
