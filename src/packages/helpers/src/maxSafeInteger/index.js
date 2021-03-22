// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER#polyfill
export default () => {
  if (!Number.MAX_SAFE_INTEGER) {
    return 9007199254740991;
  }
  return Number.MAX_SAFE_INTEGER;
};
