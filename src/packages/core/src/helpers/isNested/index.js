import isObject from '../isObject';
import isArray from '../isArray';

function isNested(object, omitArrays = false) {
  if (!isObject(object)) { return false; }

  return Object.keys(object).some((key) => {
    const value = object[key];

    if (omitArrays && isArray(value)) { return false; }

    return isObject(value);
  });
}

export default isNested;
