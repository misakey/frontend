import React from 'react';
import Screen from 'components/dumb/Screen';

// CONSTANTS
const FORBIDDEN_ERROR = new Error();
FORBIDDEN_ERROR.status = 403;

const ERROR_STATE = {
  error: FORBIDDEN_ERROR,
};

// COMPONENTS
const ScreenForbidden = (props) => (
  <Screen state={ERROR_STATE} {...props} />
);

export default ScreenForbidden;
