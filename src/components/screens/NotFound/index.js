import React from 'react';
import ScreenError from 'components/dumb/Screen/Error';

const NotFound = () => (
  <ScreenError httpStatus={404} />
);

export default NotFound;
