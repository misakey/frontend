import isProbablyBase64 from '@misakey/helpers/isProbablyBase64';

import camelCase from '../camelCase';
import isArray from '../isArray';
import isObject from '../isObject';

export default function objectToCamelCaseDeep(object, { ignoreBase64 = false } = {}) {
  // in JS an array is also an object
  if (isArray(object)) {
    return object.map((value) => (
      isObject(value)
        ? objectToCamelCaseDeep(value, { ignoreBase64 })
        : value
    ));
  }

  const newObject = {};

  Object.entries(object).forEach(([key, value]) => {
    const newKey = (ignoreBase64 && isProbablyBase64(key)) ? key : camelCase(key);

    newObject[newKey] = (
      isObject(value)
        ? objectToCamelCaseDeep(value, { ignoreBase64 })
        : value
    );
  });

  return newObject;
}
