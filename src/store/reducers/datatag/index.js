import { createSelector } from 'reselect';

import prop from '@misakey/helpers/prop';

export const selectors = {
  getDatatagById: createSelector(
    (state) => state.entities.datatags,
    (_, id) => id,
    (entities, id) => prop(id, entities),
  ),
};
