import React, { useMemo } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import LinearProgress from '@material-ui/core/LinearProgress';

// CONSTANTS
const SIGNUP_STEPS = {
  [routes.auth.signUp.preamble]: 0,
  [routes.auth.signUp.identifier]: 20,
  [routes.auth.signUp.handle]: 40,
  [routes.auth.signUp.password]: 60,
  [routes.auth.signUp.confirm]: 80,
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
    <LinearProgress value={value} variant="determinate" color="secondary" {...props} />
  );
};

export default ProgressSignUp;
