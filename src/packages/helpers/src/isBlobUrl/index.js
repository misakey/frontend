// CONSTANTS
const PREFIX_REG = new RegExp('^blob:');

// HELPERS
const hasPrefix = (arg) => PREFIX_REG.test(arg);

export default (arg) => hasPrefix(arg);
