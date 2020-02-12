import getDateFormat from '@misakey/helpers/getDateFormat';

import isObject from '@misakey/helpers/isObject';

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
