import React, { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';
import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';

import isFunction from '@misakey/core/helpers/isFunction';

import { useHistory } from 'react-router-dom';

import ButtonSignOut from '@misakey/react/auth/components/Button/SignOut';
import CardIdentityThumbnail from '@misakey/react/auth/components/Card/Identity/Thumbnail';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import withIdentity from 'components/smart/withIdentity';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Footer from '@misakey/ui/Footer';
import IconButtonDarkmode from 'components/smart/IconButton/Darkmode';

// CONSTANTS
const FOOTER_CONTAINER_PROPS = { mx: 2 };
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};
// COMPONENTS
const CardIdentityThumbnailWithIdentity = withIdentity(CardIdentityThumbnail);

const BoxAccount = forwardRef(({ actions, children, onClose, ...props }, ref) => {
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
      flexGrow={1}
      {...props}
    >
      <AppBarStatic
        toolbarProps={TOOLBAR_PROPS}
      >
        {actions}
        <BoxFlexFill />
        <IconButtonDarkmode edge="end" />
      </AppBarStatic>
      <Box display="flex" flexDirection="column" alignItems="center" flexShrink="0" mb={1}>
        <CardIdentityThumbnailWithIdentity onClick={handleClose} />
      </Box>
      {children}
      <Divider />
      <Box display="flex" flexDirection="column" flexShrink="0" my={1}>
        <ButtonSignOut onSuccess={onSignedOut} onClick={handleClose} />
      </Box>
      <Divider />
      <BoxFlexFill />
      <Footer square containerProps={FOOTER_CONTAINER_PROPS} />
    </Box>
  );
});


BoxAccount.propTypes = {
  actions: PropTypes.node,
  children: PropTypes.node,
  onClose: PropTypes.func,
};

BoxAccount.defaultProps = {
  actions: null,
  children: null,
  onClose: null,
};

export default BoxAccount;
