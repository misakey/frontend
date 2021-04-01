import React, { useCallback } from 'react';

import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';
import logWithMatomo from '@misakey/core/helpers/log/matomo';


// COMPONENTS
const withLogInMatomo = (Component) => {
  const Wrapper = ({ onClick, matomoProps, ...props }) => {
    const onWrapperClick = useCallback(
      (...args) => {
        logWithMatomo(matomoProps);
        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [matomoProps, onClick],
    );

    return (
      <Component onClick={onWrapperClick} {...props} />
    );
  };

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    matomoProps: PropTypes.shape({
      category: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
      name: PropTypes.string,
      value: PropTypes.string,
    }).isRequired,
  };

  Wrapper.defaultProps = {
    onClick: null,
  };

  return Wrapper;
};

export default withLogInMatomo;
