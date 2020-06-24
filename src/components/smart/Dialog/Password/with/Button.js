import React from 'react';
import PropTypes from 'prop-types';

import withDialogPassword from 'components/smart/Dialog/Password/with';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

const ButtonRebind = ({ ...props }) => (
  <Button {...props} />
);

ButtonRebind.propTypes = {
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
};

ButtonRebind.defaultProps = {
  standing: BUTTON_STANDINGS.MAIN,
};

export default withDialogPassword(ButtonRebind);
