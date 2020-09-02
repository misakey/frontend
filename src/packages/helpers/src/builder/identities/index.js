import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import toFormData from '@misakey/helpers/toFormData';

export const updateIdentity = ({ id, ...payload }) => API
  .use(API.endpoints.identities.update)
  .build({ id }, objectToSnakeCase(payload))
  .send();

export const uploadAvatar = ({ id, avatar }) => API
  .use(API.endpoints.identities.avatar.update)
  .build({ id }, toFormData(avatar))
  .send({ contentType: null });

export const addCoupon = ({ id, coupon }) => API
  .use(API.endpoints.identities.coupon.add)
  .build({ id }, objectToSnakeCase({ value: coupon }))
  .send();
