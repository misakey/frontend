import isMap from '@misakey/helpers/isMap';

/**
 * @param {string} search
 * @param {Map.<string,any>} paramsMap
 * @returns {string}
 */
// @FIXME move to js-common
export default (search, paramsMap = new Map()) => {
  if (!isMap(paramsMap)) {
    throw new Error('Invalid paramsMap parameter!');
  }

  const nextSearch = new URLSearchParams(search);
  paramsMap.forEach((value, key) => {
    nextSearch.set(key, value);
  });

  return nextSearch.toString();
};
