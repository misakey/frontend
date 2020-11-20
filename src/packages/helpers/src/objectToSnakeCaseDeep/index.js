import isProbablyBase64 from '@misakey/helpers/isProbablyBase64';

import snakeCase from '../snakeCase';
import isArray from '../isArray';
import isObject from '../isObject';

export default function objectToSnakeCaseDeep(object, { ignoreBase64 = false } = {}) {
  // in JS an array is also an object
  if (isArray(object)) {
    return object.map((value) => (
      isObject(value)
        ? objectToSnakeCaseDeep(value, { ignoreBase64 })
        : value
    ));
  }

  const newObject = {};

  Object.entries(object).forEach(([key, value]) => {
    const newKey = (ignoreBase64 && isProbablyBase64(key)) ? key : snakeCase(key);

    newObject[newKey] = (
      isObject(value)
        ? objectToSnakeCaseDeep(value, { ignoreBase64 })
        : value
    );
  });

  return newObject;
}
