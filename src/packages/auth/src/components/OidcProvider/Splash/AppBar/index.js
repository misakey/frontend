import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';

import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ButtonConnectUser from '@misakey/ui/Button/Connect/User';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

export const APPBAR_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    minHeight: APPBAR_HEIGHT,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  searchBar: {
    margin: 'auto',
  },
}));

// COMPONENTS
const OidcProviderAppBar = ({
  className,
  toolbarProps,
  userProps,
  ...rest
}) => {
  const classes = useStyles();

  const displayConnectedUser = useMemo(
    () => !isEmpty(userProps),
    [userProps],
  );

  return (
    <MuiAppBar
      component="nav"
      position="fixed"
      color="inherit"
      elevation={0}
      className={clsx(
        classes.appBar,
        className,
      )}
      {...(rest)}
    >
      <Toolbar {...toolbarProps}>
        <BoxFlexFill />
        {displayConnectedUser && (
          <ButtonConnectUser
            {...userProps}
            disabled
          />
        )}
      </Toolbar>
    </MuiAppBar>
  );
};

OidcProviderAppBar.propTypes = {
  className: PropTypes.string,
  toolbarProps: PropTypes.objectOf(PropTypes.any),
  userProps: PropTypes.object,
};

OidcProviderAppBar.defaultProps = {
  className: '',
  toolbarProps: {},
  userProps: {},
};

export default OidcProviderAppBar;
