import whereEq from '@misakey/core/helpers/whereEq';
import isNil from '@misakey/core/helpers/isNil';
import none from '@misakey/core/helpers/none';
import props from '@misakey/core/helpers/props';
import compose from '@misakey/core/helpers/compose';


// check keys from searchParams in locationSearchParams
export const hasAllKeys = compose(
  none(isNil),
  props,
);

// check keys and values from searchParams in locationSearchParams
export const hasAllKeysAndValues = whereEq;
