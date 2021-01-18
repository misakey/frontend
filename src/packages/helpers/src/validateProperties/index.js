import isNil from '@misakey/helpers/isNil';
import complement from '@misakey/helpers/complement';

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
