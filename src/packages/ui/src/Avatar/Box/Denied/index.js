import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BadgeDenied from '@misakey/ui/Badge/Denied';
import AvatarBox from '@misakey/ui/Avatar/Box';
import { SIZES, MEDIUM } from '@misakey/ui/constants/sizes';

// COMPONENTS
const AvatarBoxDenied = ({ size, ...props }) => {
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
      <AvatarBox size={size} {...props} />
    </BadgeDenied>
  );
};
AvatarBoxDenied.propTypes = {
  size: PropTypes.oneOf(SIZES),
};

AvatarBoxDenied.defaultProps = {
  size: MEDIUM,
};

export default AvatarBoxDenied;
