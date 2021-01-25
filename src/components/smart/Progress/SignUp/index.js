import React, { useMemo } from 'react';

import { useLocation, matchPath } from 'react-router-dom';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import LinearProgress from '@material-ui/core/LinearProgress';

// CONSTANTS
const STEP_VALUE = 100 / 6;

const SIGNUP_STEPS = {
  [routes.auth.signUp.preamble]: 0,
  [routes.auth.signUp.identifier]: STEP_VALUE,
  [routes.auth.signUp.handle]: 2 * STEP_VALUE,
  [routes.auth.signUp.notifications]: 3 * STEP_VALUE,
  [routes.auth.signUp.password]: 4 * STEP_VALUE,
  [routes.auth.signUp.confirm]: 5 * STEP_VALUE,
  [routes.auth.signUp.finale]: 100,
};

// HELPERS
const getStepEntry = (pathname) => Object.entries(SIGNUP_STEPS)
  .find(([path]) => !isNil(matchPath(pathname, { path, exact: true })));

// COMPONENTS
const ProgressSignUp = (props) => {
  const { pathname } = useLocation();

  const value = useMemo(
    () => {
      const stepEntry = getStepEntry(pathname);
      const [, stepValue] = isNil(stepEntry) ? [] : stepEntry;
      return stepValue;
    },
    [pathname],
  );

  return (
    <LinearProgress value={value} variant="determinate" {...props} />
  );
};

export default ProgressSignUp;
