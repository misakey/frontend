import camelCase from '../camelCase';
import isArray from '../isArray';
import isObject from '../isObject';

export default function objectToCamelCaseDeep(object) {
  // in JS an array is also an object
  if (isArray(object)) {
    return object.map((value) => (
      isObject(value)
        ? objectToCamelCaseDeep(value)
        : value
    ));
  }

  const newObject = {};

  Object.entries(object).forEach(([key, value]) => {
    newObject[camelCase(key)] = (
      isObject(value)
        ? objectToCamelCaseDeep(value)
        : value
    );
  });

  return newObject;
}
