import whereEq from '@misakey/helpers/whereEq';
import isNil from '@misakey/helpers/isNil';
import none from '@misakey/helpers/none';
import props from '@misakey/helpers/props';
import compose from '@misakey/helpers/compose';


// check keys from searchParams in locationSearchParams
export const hasAllKeys = compose(
  none(isNil),
  props,
);

// check keys and values from searchParams in locationSearchParams
export const hasAllKeysAndValues = whereEq;
