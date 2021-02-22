import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BadgeDenied from '@misakey/ui/Badge/Denied';
import { SIZES, MEDIUM } from '@misakey/ui/constants/sizes';

// COMPONENTS
const BadgeDeniedWrapper = ({ size, children }) => {
  // convert size values to fontSize values,
  // see https://material-ui.com/api/icon/#props
  const fontSize = useMemo(
    () => (size === MEDIUM ? 'default' : size),
    [size],
  );
  return (
    <BadgeDenied
      fontSize={fontSize}
    >
      {children}
    </BadgeDenied>
  );
};

BadgeDeniedWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  size: PropTypes.oneOf(SIZES),
};

BadgeDeniedWrapper.defaultProps = {
  children: null,
  size: MEDIUM,
};

export default BadgeDeniedWrapper;
