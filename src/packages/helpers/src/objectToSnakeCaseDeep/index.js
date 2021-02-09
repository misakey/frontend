import isProbablyBase64 from '@misakey/helpers/isProbablyBase64';

import snakeCase from '../snakeCase';
import isArray from '../isArray';
import isObject from '../isObject';

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
    const shouldConvert = !isExcludedKey && !isIgnoredBase64;
    // @FIXME: `.replace('base_64', 'base64')` should be
    // fixed with https://gitlab.misakey.dev/misakey/frontend/-/merge_requests/754
    const newKey = shouldConvert ? snakeCase(key).replace('base_64', 'base64') : key;

    newObject[newKey] = (
      isObject(value) && shouldConvert
        ? objectToSnakeCaseDeep(value, { ignoreBase64, excludedKeys })
        : value
    );
  });

  return newObject;
}
