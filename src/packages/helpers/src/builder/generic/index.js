import API from '@misakey/api';

export const getVersionBuilder = () => API
  .use(API.endpoints.generic.version.read)
  .build()
  .send();
