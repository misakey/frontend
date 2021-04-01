import getDateFormat from '@misakey/core/helpers/getDateFormat';

import isObject from '@misakey/core/helpers/isObject';

export default (obj) => {
  if (isObject(obj)) {
    const { createdAt, updatedAt, ...rest } = obj;
    return {
      createdAt: getDateFormat(createdAt),
      updatedAt: getDateFormat(updatedAt),
      ...rest,
    };
  }
  return obj;
};
