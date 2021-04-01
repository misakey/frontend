import { StatusCodes } from 'http-status-codes';

import prop from '@misakey/core/helpers/prop';
import path from '@misakey/core/helpers/path';
import props from '@misakey/core/helpers/props';
import any from '@misakey/core/helpers/any';
import equals from '@misakey/core/helpers/equals';
import propOr from '@misakey/core/helpers/propOr';
import head from '@misakey/core/helpers/head';
import compose from '@misakey/core/helpers/compose';
import has from '@misakey/core/helpers/has';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';

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
