import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BadgeDenied from '@misakey/ui/Badge/Denied';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import { SIZES, MEDIUM } from '@misakey/ui/Avatar';

// COMPONENTS
const AvatarMisakeyDenied = ({ size, ...props }) => {
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
      <AvatarMisakey size={size} {...props} />
    </BadgeDenied>
  );
};

AvatarMisakeyDenied.propTypes = {
  size: PropTypes.oneOf(SIZES),
};

AvatarMisakeyDenied.defaultProps = {
  size: MEDIUM,
};

export default AvatarMisakeyDenied;
