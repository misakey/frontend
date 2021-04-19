import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import withDialogPassword from '@misakey/react/auth/components/Dialog/Password/with';
import IconButton from '@misakey/ui/IconButton';

const IconButtonRebind = ComponentProxy(IconButton);

IconButtonRebind.propTypes = {
  color: PropTypes.string,
};

IconButtonRebind.defaultProps = {
  color: 'primary',
};

export default withDialogPassword(IconButtonRebind);
