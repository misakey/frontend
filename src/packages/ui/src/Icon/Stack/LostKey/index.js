import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import IconStack from '@misakey/ui/Icon/Stack';

import VpnKeyIcon from '@material-ui/icons/VpnKeyRounded';
import ClearIcon from '@material-ui/icons/ClearRounded';

// COMPONENTS
const IconStackLostKey = ComponentProxy(IconStack);

IconStackLostKey.propTypes = {
  ForegroundIcon: PropTypes.elementType,
  BackgroundIcon: PropTypes.elementType,
};

IconStackLostKey.defaultProps = {
  ForegroundIcon: VpnKeyIcon,
  BackgroundIcon: ClearIcon,
};

export default IconStackLostKey;
