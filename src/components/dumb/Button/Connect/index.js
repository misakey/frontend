import PropTypes from 'prop-types';

import ComponentProxy from 'components/dumb/ComponentProxy';

import ButtonConnectWrapper from '@misakey/auth/components/Button/Connect/Wrapper';
import AccountLink from 'components/dumb/Link/Account';

const ButtonConnect = ComponentProxy(ButtonConnectWrapper);
ButtonConnect.propTypes = {
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
};

ButtonConnect.defaultProps = {
  AccountLink,
};

export default ButtonConnect;
