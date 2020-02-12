import prop from '@misakey/helpers/prop';
import head from '@misakey/helpers/head';
import compose from '@misakey/helpers/compose';
import has from '@misakey/helpers/has';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export const getDetails = compose(
  objectToCamelCase,
  prop('details'),
);

export const getDetailKeys = compose(
  Object.keys,
  getDetails,
);

export const hasDetailKey = (key) => compose(
  (details) => has(details, key),
  getDetails,
);

export const getDetailPairs = compose(
  Object.entries,
  getDetails,
);

// get only first pair from details
export const getDetailPairsHead = compose(
  head,
  getDetailPairs,
);

export const getDetailValue = (key) => compose(
  (details) => prop(key, details),
  getDetails,
);
