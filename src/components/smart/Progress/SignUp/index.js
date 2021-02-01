import React, { useMemo } from 'react';

import { useLocation, matchPath } from 'react-router-dom';

import authRoutes from '@misakey/react-auth/routes';

import isNil from '@misakey/helpers/isNil';

import LinearProgress from '@material-ui/core/LinearProgress';

// CONSTANTS
const STEP_VALUE = 100 / 6;

const SIGNUP_STEPS = {
  [authRoutes.signUp.preamble]: 0,
  [authRoutes.signUp.identifier]: STEP_VALUE,
  [authRoutes.signUp.handle]: 2 * STEP_VALUE,
  [authRoutes.signUp.notifications]: 3 * STEP_VALUE,
  [authRoutes.signUp.password]: 4 * STEP_VALUE,
  [authRoutes.signUp.confirm]: 5 * STEP_VALUE,
  [authRoutes.signUp.finale]: 100,
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
