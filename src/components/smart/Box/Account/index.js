import React, { useCallback, forwardRef } from 'react';

import { useHistory } from 'react-router-dom';
import routes from 'routes';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';

import ButtonSignOut from '@misakey/react-auth/components/Button/SignOut';
import CardIdentityThumbnail from '@misakey/react-auth/components/Card/Identity/Thumbnail';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import withIdentity from 'components/smart/withIdentity';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Footer from '@misakey/ui/Footer';
import DarkmodeSwitch from 'components/smart/Switch/Darkmode';

// CONSTANTS
const FOOTER_CONTAINER_PROPS = { mx: 2 };

// COMPONENTS
const CardIdentityThumbnailWithIdentity = withIdentity(CardIdentityThumbnail);

const BoxAccount = forwardRef(({ children, onClose, ...props }, ref) => {
  const history = useHistory();

  const handleClose = useCallback(
    (e) => {
      if (isFunction(onClose)) {
        onClose(e);
      }
    },
    [onClose],
  );

  const onSignedOut = useCallback(() => history.replace(routes._), [history]);

  return (
    <Box
      ref={ref}
      display="flex"
      overflow="hidden"
      flexDirection="column"
      {...props}
    >
      <AppBarStatic>
        {children}
        <BoxFlexFill />
        <DarkmodeSwitch />
      </AppBarStatic>
      <Box display="flex" flexDirection="column" alignItems="center" flexShrink="0">
        <CardIdentityThumbnailWithIdentity onClick={handleClose} />
      </Box>
      <Divider />
      <Box display="flex" flexDirection="column" flexShrink="0" mx={4} my={2}>
        <ButtonSignOut onSuccess={onSignedOut} onClick={handleClose} />
      </Box>
      <Divider />
      <BoxFlexFill />
      <Footer containerProps={FOOTER_CONTAINER_PROPS} />
    </Box>
  );
});


BoxAccount.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
};

BoxAccount.defaultProps = {
  children: null,
  onClose: null,
};

export default BoxAccount;
