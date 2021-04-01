import head from '@misakey/core/helpers/head';
import isArray from '@misakey/core/helpers/isArray';
import isEmpty from '@misakey/core/helpers/isEmpty';

export const parseAcrValues = (acrValues) => (isArray(acrValues)
  ? parseInt(head(acrValues), 10)
  : null
);

export const parseAcr = (acr) => (isEmpty(acr) ? null : parseInt(acr, 10));
