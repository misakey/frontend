import PropTypes from 'prop-types';

import BadgeDenied from '@misakey/ui/Badge/Denied';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';

// COMPONENTS
const AvatarMisakeyDenied = ({ large, ...props }) => (
  <BadgeDenied
    large={large}
  >
    <AvatarMisakey large={large} {...props} />
  </BadgeDenied>
);

AvatarMisakeyDenied.propTypes = {
  large: PropTypes.bool,
};

AvatarMisakeyDenied.defaultProps = {
  large: false,
};

export default AvatarMisakeyDenied;
