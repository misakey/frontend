import snakeCase from '../snakeCase';
import isArray from '../isArray';
import isObject from '../isObject';

export default function objectToSnakeCaseDeep(object) {
  // in JS an array is also an object
  if (isArray(object)) {
    return object.map((value) => (
      isObject(value)
        ? objectToSnakeCaseDeep(value)
        : value
    ));
  }

  const newObject = {};

  Object.entries(object).forEach(([key, value]) => {
    newObject[snakeCase(key)] = (
      isObject(value)
        ? objectToSnakeCaseDeep(value)
        : value
    );
  });

  return newObject;
}
