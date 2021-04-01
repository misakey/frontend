import isMap from '@misakey/core/helpers/isMap';

/**
 * @param {string} search
 * @param {Map.<string,any>} paramsMap
 * @returns {string}
 */
export default (search = '', paramsMap = new Map()) => {
  if (!isMap(paramsMap)) {
    throw new Error('Invalid paramsMap parameter!');
  }

  const nextSearch = new URLSearchParams(search);
  paramsMap.forEach((value, key) => {
    if (value !== undefined) {
      nextSearch.set(key, value);
    } else {
      nextSearch.delete(key);
    }
  });

  return nextSearch.toString();
};
