import isObject from '../isObject';
import isArray from '../isArray';

function objectToQueryString(object = {}, prefix) {
  if (!isObject(object)) { throw new Error(`${object} is not an object`); }

  const str = [];

  Object.keys(object).forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(object, property)) {
      const key = prefix ? `${prefix}[${property}]` : property;
      const value = object[property];

      str.push((value !== null && !isArray(value) && isObject(value))
        ? objectToQueryString(value, key)
        : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  });

  return str.join('&');
}

export default objectToQueryString;
