import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import ScreenSplashBase from '@misakey/ui/Screen/Splash/Base';
import IconProgress from '@misakey/ui/Icon/Progress';

import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

// CONSTANTS
const PROGRESS_PROPS = { disableShrink: true };

// COMPONENTS
const ScreenSplashVault = ({ done, children, ...rest }) => (
  <ScreenSplashBase {...rest}>
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      my={2}
    >
      <IconProgress
        isLoading={!done}
        done={done}
        Icon={LockIcon}
        DoneIcon={LockOpenIcon}
        fontSize="large"
        color="primary"
        progressProps={PROGRESS_PROPS}
      />
      {children}
    </Box>
  </ScreenSplashBase>
);

ScreenSplashVault.propTypes = {
  done: PropTypes.bool,
  children: PropTypes.node,
};

ScreenSplashVault.defaultProps = {
  children: null,
};

ScreenSplashVault.defaultProps = {
  done: false,
};

export default ScreenSplashVault;
