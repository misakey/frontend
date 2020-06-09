import API from '@misakey/api';

export default () => API.use(API.endpoints.auth.signOut)
  .build()
  .send();
