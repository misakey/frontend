import isArray from '@misakey/helpers/isArray';
import isObject from '@misakey/helpers/isObject';

function match(value) {
  return isArray(value) || isObject(value);
}

function format() {
  return false;
}

export default [match, format];
