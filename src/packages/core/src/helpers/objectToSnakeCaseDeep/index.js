import isProbablyBase64 from '@misakey/core/helpers/isProbablyBase64';

import snakeCase from '../snakeCase';
import isArray from '../isArray';
import isObject from '../isObject';
import isUUID from '../isUUID';

/**
 * Key will not be converted if it's a UUID
 * or if it looks like base64 and `ignoreBase64` is true,
 * or if it matches one of `excludedKeys`.
 *
 * Also if it matches `excludedKeys` the value associated to this key
 * is not processed.
 */
export default function objectToSnakeCaseDeep(
  object,
  { ignoreBase64 = false, excludedKeys = [] } = {},
) {
  // in JS an array is also an object
  if (isArray(object)) {
    return object.map((value) => (
      isObject(value)
        ? objectToSnakeCaseDeep(value, { ignoreBase64, excludedKeys })
        : value
    ));
  }

  const newObject = {};

  Object.entries(object).forEach(([key, value]) => {
    const isIgnoredBase64 = ignoreBase64 && isProbablyBase64(key);
    const isExcludedKey = excludedKeys.includes(key);
    const shouldConvert = !isExcludedKey && !isIgnoredBase64 && !isUUID(key);
    const newKey = shouldConvert ? snakeCase(key) : key;

    // If key matched one of `excludedKeys`, do not process the value either
    if (isObject(value) && !isExcludedKey) {
      newObject[newKey] = objectToSnakeCaseDeep(value, { ignoreBase64, excludedKeys });
    } else {
      newObject[newKey] = value;
    }
  });

  return newObject;
}
