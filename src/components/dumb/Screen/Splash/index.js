import React from 'react';
import PropTypes from 'prop-types';
import Screen from 'components/dumb/Screen/index';

function ScreenSplash({ text }) {
  return <Screen state={{ isLoading: true, splashScreenText: text }} />;
}

ScreenSplash.propTypes = {
  text: PropTypes.string,
};

ScreenSplash.defaultProps = {
  text: null,
};

export default ScreenSplash;
