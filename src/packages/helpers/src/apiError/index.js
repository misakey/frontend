import { StatusCodes } from 'http-status-codes';

import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import props from '@misakey/helpers/props';
import any from '@misakey/helpers/any';
import equals from '@misakey/helpers/equals';
import propOr from '@misakey/helpers/propOr';
import head from '@misakey/helpers/head';
import compose from '@misakey/helpers/compose';
import has from '@misakey/helpers/has';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

// CONSTANTS
const EMPTY_OBJ = {};

export const getCode = prop('code');
export const getOrigin = prop('origin');
export const getUrlOrigin = path(['rawResponse', 'url']);
export const getDescription = prop('desc');

export const isInternalError = compose(
  any(equals(StatusCodes.INTERNAL_SERVER_ERROR)),
  props(['code', 'status']),
);

export const getDetails = compose(
  objectToCamelCase,
  propOr(EMPTY_OBJ, 'details'),
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
