import API from '@misakey/core/api';


export default () => API
  .use()
  .build()
  .send(undefined, { requestUri: 'https://bug.misakey.com.local', method: 'GET' });
