import React from 'react';
import Screen from 'components/dumb/Screen';
// CONSTANTS
const NOT_FOUND_ERROR = new Error();
NOT_FOUND_ERROR.status = 404;

const ERROR_STATE = {
  error: NOT_FOUND_ERROR,
};

// COMPONENTS
function NotFound() {
  return (
    <Screen state={ERROR_STATE} />
  );
}

export default NotFound;
