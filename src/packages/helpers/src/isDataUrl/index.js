import isString from '@misakey/helpers/isString';

// CONSTANTS
const PREFIX_REG = new RegExp('^data:');

// HELPERS
const hasPrefix = (arg) => PREFIX_REG.test(arg);

export default (arg) => isString(arg) && hasPrefix(arg);
