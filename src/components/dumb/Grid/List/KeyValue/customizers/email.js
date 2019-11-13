import isEmail from '@misakey/helpers/isEmail';
import link from './link';

function match(value) {
  return isEmail(value);
}

function format(value, key, t) {
  return link[1](`mailto: ${value}`, key, t, value);
}

export default [match, format];
