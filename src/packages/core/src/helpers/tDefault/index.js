import isString from '../isString';
import isArray from '../isArray';
import last from '../last';

function tDefault(keys, options) {
  if (isString(options)) { return options; }
  if (isArray(keys)) { return last(keys); }

  return keys;
}

export default tDefault;
