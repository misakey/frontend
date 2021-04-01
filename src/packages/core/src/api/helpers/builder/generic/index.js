import API from '@misakey/core/api';

export const getVersionBuilder = () => API
  .use(API.endpoints.generic.version.read)
  .build()
  .send();
