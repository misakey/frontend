import isProbablyBase64 from '@misakey/core/helpers/isProbablyBase64';

import camelCase from '../camelCase';
import isArray from '../isArray';
import isObject from '../isObject';
import isUUID from '../isUUID';

function shouldSkip(key, { ignoreBase64, ignoreDotted }) {
  if (ignoreBase64 && isProbablyBase64(key)) {
    return true;
  }

  if (ignoreDotted && (key.indexOf('.') !== -1)) {
    return true;
  }

  if (isUUID(key)) {
    return true;
  }

  return false;
}

export default function objectToCamelCaseDeep(
  object,
  { ignoreBase64 = false, ignoreDotted = false } = {},
) {
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
    const newKey = shouldSkip(key, { ignoreBase64, ignoreDotted }) ? key : camelCase(key);

    newObject[newKey] = (
      isObject(value)
        ? objectToCamelCaseDeep(value, { ignoreBase64, ignoreDotted })
        : value
    );
  });

  return newObject;
}
