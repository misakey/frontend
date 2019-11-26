import React from 'react';
import ScreenError from 'components/dumb/Screen/Error';

const Forbidden = () => (
  <ScreenError httpStatus={403} />
);

export default Forbidden;
