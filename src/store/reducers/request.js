import { createSelector } from 'reselect';
import propOr from '@misakey/helpers/propOr';

// SELECTORS
const getRequestSelector = createSelector(
  (state) => state.entities.databoxes,
  (items) => (id) => propOr(null, id)(items),
);

export const getRequestById = (state, id) => getRequestSelector(state)(id);
