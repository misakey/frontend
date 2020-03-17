import React from 'react';
import PropTypes from 'prop-types';

import useWidth from '@misakey/hooks/useWidth';

import AppBarNavigation from 'components/dumb/AppBar/Navigation';

import './Error.scss';
import ErrorOverlay from 'components/dumb/Overlay/Error';

/**
 * @param error
 * @param httpStatus
 * @returns {*}
 * @constructor
 */
// @DEPRECATED
function ScreenError({ error, httpStatus }) {
  const width = useWidth();

  return (
    <section id="ScreenError" className="section">
      {width === 'xs' && <AppBarNavigation />}
      <ErrorOverlay error={error} httpStatus={httpStatus} />
    </section>
  );
}

ScreenError.propTypes = {
  error: PropTypes.string,
  httpStatus: PropTypes.number,
};

ScreenError.defaultProps = {
  error: null,
  httpStatus: null,
};

export default ScreenError;
