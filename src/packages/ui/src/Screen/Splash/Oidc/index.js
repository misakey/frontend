import React from 'react';
import PropTypes from 'prop-types';

import { LARGE } from '@misakey/ui/Avatar';

import CardUserSignOut from '@misakey/react-auth/components/Card/User/SignOut';
import ScreenSplashBase from '@misakey/ui/Screen/Splash/Base';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import IconProgress from '@misakey/ui/Icon/Progress';

import CheckIcon from '@material-ui/icons/Check';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// CONSTANTS
const CONTAINER_PROPS = {
  component: Box,
  display: 'flex !important',
  flexDirection: 'column',
  flexGrow: 1,
  maxWidth: 'sm',
};

// COMPONENTS
const ScreenSplashOidc = ({ cardUserProps, done, ...props }) => (
  <ScreenSplashBase containerProps={CONTAINER_PROPS} {...props}>
    <Box my={2} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-end" flexGrow={1}>
      <AvatarMisakey size={LARGE} />
    </Box>
    <Box display="flex" flexDirection="column" flexGrow={2}>
      <CardUserSignOut
        my={2}
        {...cardUserProps}
      >
        <Divider />
        <Box position="relative" display="flex" justifyContent="center" alignItems="center" my={2}>
          <IconProgress isLoading={!done} done={done} Icon={HourglassEmptyIcon} DoneIcon={CheckIcon} fontSize="large" color="primary" />
        </Box>
      </CardUserSignOut>
    </Box>
  </ScreenSplashBase>
);

ScreenSplashOidc.propTypes = {
  cardUserProps: PropTypes.object,
  done: PropTypes.bool,
};

ScreenSplashOidc.defaultProps = {
  cardUserProps: {},
  done: false,
};

export default ScreenSplashOidc;
