import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const getRequestBuilder = (id, body, queryParams = { withUser: true }) => API
  .use(API.endpoints.request.read)
  .build({ id }, body, objectToSnakeCase(queryParams))
  .send()
  .then((reponse) => objectToCamelCaseDeep(reponse));

export const getRequestLogsBuilder = (id) => API
  .use(API.endpoints.request.logs.find)
  .build(null, null, objectToSnakeCase({ databoxId: id }))
  .send()
  .then((logs) => logs.map(objectToCamelCaseDeep));

export const getRequestWithLogsBuilder = (id) => Promise.all([
  getRequestBuilder(id),
  getRequestLogsBuilder(id),
])
  .then(([request, logs]) => ({
    ...request,
    logs,
  }));

export const getRequestBlobsBuilder = (id) => API
  .use(API.endpoints.request.blob.find)
  .build(null, null, objectToSnakeCase({ databoxIds: id }))
  .send()
  .then((blobs) => blobs.map(objectToCamelCaseDeep));
