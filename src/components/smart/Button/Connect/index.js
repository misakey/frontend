import PropTypes from 'prop-types';

import routes from 'routes';
import { IS_PLUGIN } from 'constants/plugin';

import { redirectToApp } from '@misakey/helpers/plugin';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import ButtonConnectWrapper from '@misakey/auth/components/Button/Connect/Wrapper';
import AccountLink from 'components/dumb/Link/Account';

// HELPERS
const signInActionForPlugin = () => redirectToApp(routes.auth.redirectToSignIn);
const redirectToWebAppAccount = () => redirectToApp(routes.account._);

// COMPONENTS
const ButtonConnect = ComponentProxy(ButtonConnectWrapper);
ButtonConnect.propTypes = {
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  signInAction: PropTypes.func,
  customAction: PropTypes.func,
};

ButtonConnect.defaultProps = {
  AccountLink,
  signInAction: IS_PLUGIN ? signInActionForPlugin : null,
  customAction: IS_PLUGIN ? redirectToWebAppAccount : null,
};

export default ButtonConnect;
