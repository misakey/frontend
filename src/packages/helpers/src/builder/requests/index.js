import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';

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

export const patchRequestUserEmailBuilder = (databoxId, userEmailId) => API
  .use(API.endpoints.request.update)
  .build({ id: databoxId }, objectToSnakeCase({ userEmailId }))
  .send();

export const getUserRequestsBuilder = (payload) => API
  .use(API.endpoints.request.find)
  .build(null, null, objectToSnakeCase({
    withBlobCount: true,
    withUsers: true,
    orderBy: 'updated_at DESC',
    ...payload,
  }))
  .send();

export const countUserRequestsBuilder = (payload) => {
  const query = isNil(payload) ? {} : objectToSnakeCase(payload);
  return API
    .use(API.endpoints.request.count)
    .build(null, null, query)
    .send()
    .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));
};
