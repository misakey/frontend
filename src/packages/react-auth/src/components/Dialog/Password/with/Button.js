import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import withDialogPassword from '@misakey/react-auth/components/Dialog/Password/with';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

const ButtonRebind = ComponentProxy(Button);

ButtonRebind.propTypes = {
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
};

ButtonRebind.defaultProps = {
  standing: BUTTON_STANDINGS.MAIN,
};

export default withDialogPassword(ButtonRebind);
