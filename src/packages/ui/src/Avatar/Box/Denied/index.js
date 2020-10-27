import React from 'react';
import PropTypes from 'prop-types';

import BadgeDenied from '@misakey/ui/Badge/Denied';
import AvatarBox from '@misakey/ui/Avatar/Box';

// COMPONENTS
const AvatarBoxDenied = ({ large, ...props }) => (
  <BadgeDenied
    large={large}
  >
    <AvatarBox large={large} {...props} />
  </BadgeDenied>
);

AvatarBoxDenied.propTypes = {
  large: PropTypes.bool,
};

AvatarBoxDenied.defaultProps = {
  large: false,
};

export default AvatarBoxDenied;
