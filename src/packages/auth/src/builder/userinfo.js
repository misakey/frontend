import API from '@misakey/api';

export default () => API.use(API.endpoints.auth.userinfo)
  .build()
  .send();
