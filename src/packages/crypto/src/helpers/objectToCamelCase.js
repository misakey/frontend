// an improvement over the objectToCamelCase function
// provided by Misakey helpers packages
// should probably be moved to Misakey helpers one day

import camelCase from '@misakey/core/helpers/camelCase';
import isArray from '@misakey/core/helpers/isArray';
import isObject from '@misakey/core/helpers/isObject';

export default function objectToCamelCase(object) {
  // in JS an array is also an object
  if (isArray(object)) {
    return object.map((value) => (
      isObject(value)
        ? objectToCamelCase(value)
        : value
    ));
  }

  const newObject = {};

  Object.entries(object).forEach(([key, value]) => {
    newObject[camelCase(key)] = (
      isObject(value)
        ? objectToCamelCase(value)
        : value
    );
  });

  return newObject;
}
