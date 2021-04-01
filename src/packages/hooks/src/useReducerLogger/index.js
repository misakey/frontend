import defaults from 'redux-logger/src/defaults';

import isNil from '@misakey/core/helpers/isNil';
import equals from '@misakey/core/helpers/equals';

import { useCallback } from 'react';

// CONSTANTS
const { colors } = defaults;

/* eslint-disable no-console */

// HOOK
export default (reducer) => {
  const reducerLogged = useCallback(
    (state, action) => {
      const next = reducer(state, action);
      if (!isNil(state) && !equals(next, state)) {
        const title = `%chook action %c${action.type.toString()}`;
        try {
          console.group(title, 'color: gray; font-weight: lighter', `color: ${colors.title()}; font-weight: 700;`);
        } catch (e) {
          console.log(title);
        }
        console.log('%cprev state', `color: ${colors.prevState()}; font-weight: 700;`, state);
        console.log('%caction', `color: ${colors.action()}; font-weight: 700;`, action);
        console.log('%cnext state', `color: ${colors.nextState()}; font-weight: 700;`, next);
        try {
          console.groupEnd();
        } catch (e) {
          console.log('--- log end ---');
        }
      }
      return next;
    },
    [reducer],
  );

  if (window.env.ENV === 'development') {
    return reducerLogged;
  }
  return reducer;
};
