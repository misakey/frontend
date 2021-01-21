import API from '@misakey/api';


export default () => API
  .use()
  .build()
  .send(undefined, { requestUri: 'https://bug.misakey.com.local', method: 'GET' });
