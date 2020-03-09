import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';


const DATABOX_PATCH_USER_EMAIL_ENDPOINT = {
  method: 'PATCH',
  path: '/databoxes/:id',
  auth: true,
};

export const patchDataboxUserEmail = (databoxId, userEmailId) => API
  .use(DATABOX_PATCH_USER_EMAIL_ENDPOINT)
  .build({ id: databoxId }, objectToSnakeCase({ userEmailId }))
  .send();
