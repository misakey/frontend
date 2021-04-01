import API from '@misakey/core/api';

export default () => API.use(API.endpoints.auth.signOut)
  .build()
  .send();
