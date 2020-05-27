import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import ButtonConnectWrapper from '@misakey/auth/components/Button/Connect/Wrapper';
import AccountLink from 'components/dumb/Link/Account';

// COMPONENTS
const ButtonConnect = ComponentProxy(ButtonConnectWrapper);
ButtonConnect.propTypes = {
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  signInAction: PropTypes.func,
  customAction: PropTypes.func,
};

ButtonConnect.defaultProps = {
  AccountLink,
  signInAction: null,
  customAction: null,
};

export default ButtonConnect;
