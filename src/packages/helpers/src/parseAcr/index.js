import head from '@misakey/helpers/head';
import isArray from '@misakey/helpers/isArray';
import isEmpty from '@misakey/helpers/isEmpty';

export const parseAcrValues = (acrValues) => (isArray(acrValues)
  ? parseInt(head(acrValues), 10)
  : null
);

export const parseAcr = (acr) => (isEmpty(acr) ? null : parseInt(acr, 10));
