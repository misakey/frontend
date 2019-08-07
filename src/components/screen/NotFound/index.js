import React from 'react';
import ScreenError from 'components/screen/Error';

const NotFound = () => (
  <ScreenError httpStatus={404} />
);

export default NotFound;
