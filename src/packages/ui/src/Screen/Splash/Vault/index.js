import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import ScreenSplashBase from '@misakey/ui/Screen/Splash/Base';
import IconProgress from '@misakey/ui/Icon/Progress';

import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';

// COMPONENTS
const ScreenSplashVault = ({ done, ...rest }) => (
  <ScreenSplashBase {...rest}>
    <Box position="relative" display="flex" justifyContent="center" alignItems="center" my={2}>
      <IconProgress
        isLoading={!done}
        done={done}
        Icon={LockIcon}
        DoneIcon={LockOpenIcon}
        fontSize="large"
        color="primary"
      />
    </Box>
  </ScreenSplashBase>
);

ScreenSplashVault.propTypes = {
  done: PropTypes.bool,
};

ScreenSplashVault.defaultProps = {
  done: false,
};

export default ScreenSplashVault;
