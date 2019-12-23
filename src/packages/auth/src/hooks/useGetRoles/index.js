import API from '@misakey/api';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { useCallback } from 'react';

export default (callbackFn) => useCallback((userId) => {
  API.use(API.endpoints.user.roles.read)
    .build(null, null, { user_id: userId })
    .send()
    .then((response) => {
      callbackFn(response.map(objectToCamelCase));
    });
}, [callbackFn]);
