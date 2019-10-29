import { createSelector } from 'reselect';
import { denormalize } from 'normalizr';
import makeMatchParamSelector from 'store/reducers/helpers/makeMatchParamsSelector';
import ApplicationSchema from 'store/schemas/Application';

import propOr from '@misakey/helpers/propOr';

// CONSTANTS
const EMPTY_LIST = [];

// HELPERS
const ratingsOrEmptyList = propOr(EMPTY_LIST, 'ratings');

// SELECTORS
const mainDomainMatchParamSelector = makeMatchParamSelector('mainDomain');

const getApplication = createSelector(
  mainDomainMatchParamSelector,
  (state) => state.entities,
  (mainDomain, entities) => denormalize(
    mainDomain,
    ApplicationSchema.entity,
    entities,
  ),
);

export const getApplicationRatings = createSelector(
  getApplication,
  ratingsOrEmptyList,
);

export const selectors = {
  getApplicationRatings,
};
