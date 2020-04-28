import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';

import OidcProviderAppBar, { APPBAR_HEIGHT } from '@misakey/auth/components/OidcProvider/Splash/AppBar';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import Box from '@material-ui/core/Box';


// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minHeight: `calc(100vh - ${APPBAR_HEIGHT}px - ${theme.spacing(3)}px)`,
    paddingTop: `calc(${APPBAR_HEIGHT}px + ${theme.spacing(3)}px)`,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

const OidcProviderSplash = ({
  userProps,
  profile,
}) => {
  const classes = useStyles();

  const userPropsWithProfile = useMemo(
    () => (isEmpty(profile)
      ? userProps
      : {
        ...userProps,
        profile,
      }),
    [profile, userProps],
  );

  return (
    <>
      <OidcProviderAppBar userProps={userPropsWithProfile} />
      <Box
        component="div"
        className={classes.root}
      >
        <SplashScreen />
      </Box>
    </>
  );
};

OidcProviderSplash.propTypes = {
  userProps: PropTypes.object,
  profile: PropTypes.object,
};

OidcProviderSplash.defaultProps = {
  userProps: {},
  profile: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

export default connect(mapStateToProps, {})(OidcProviderSplash);
