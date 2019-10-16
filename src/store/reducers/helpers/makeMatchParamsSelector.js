import { createSelector } from 'reselect';

import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';

import getMatchParams from 'helpers/getMatchParams';

export const makeMatchParamsSelector = (params) => createSelector(
  (state, props) => getMatchParams(props),
  pick(params),
);

export const makeMatchParamSelector = (param) => createSelector(
  (state, props) => getMatchParams(props),
  prop(param),
);
