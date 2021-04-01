import { createSelector } from 'reselect';

import pick from '@misakey/core/helpers/pick';
import prop from '@misakey/core/helpers/prop';

import getMatchParams from '@misakey/core/helpers/getMatchParams';

export const makeMatchParamsSelector = (params) => createSelector(
  (state, props) => getMatchParams(props),
  pick(params),
);

export const makeMatchParamSelector = (param) => createSelector(
  (state, props) => getMatchParams(props),
  prop(param),
);
