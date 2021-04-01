import isNil from '@misakey/core/helpers/isNil';
import complement from '@misakey/core/helpers/complement';

export default (object, assertFn = complement(isNil)) => {
  try {
    Object.entries(object).forEach(([key, value]) => {
      if (!assertFn(value)) {
        throw new Error(`rejectIfAnyIsNil: ${key} is required`);
      }
    });
    return null;
  } catch (err) {
    return err;
  }
};
