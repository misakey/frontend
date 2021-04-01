import isString from '@misakey/core/helpers/isString';

// CONSTANTS
const PREFIX_REG = new RegExp('^blob:');

// HELPERS
const hasPrefix = (arg) => PREFIX_REG.test(arg);

export default (arg) => isString(arg) && hasPrefix(arg);
