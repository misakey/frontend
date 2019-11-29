import React, { useMemo, useCallback } from 'react';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useWidth from '@misakey/hooks/useWidth';

import displayIn from '@misakey/helpers/displayIn';
import { redirectToApp } from 'helpers/plugin';

import ButtonConnect from 'components/dumb/Button/Connect';
import AccountCircle from '@material-ui/icons/AccountCircle';

// CONSTANTS
const SMALL_BREAKPOINTS = ['xs'];

// HOOKS
const useStyles = makeStyles((theme) => ({
  iconRoot: {
    width: '40px',
    height: '40px',
  },
  buttonConnect: {
    flexShrink: '0',
    marginLeft: 'auto',
    marginRight: theme.spacing(-1.5),
    whiteSpace: 'nowrap',
  },
  buttonTextRounded: {
    borderRadius: '200px',
  },
}));

// COMPONENTS
const ButtonConnectMain = (props) => {
  const width = useWidth();
  const classes = useStyles();

  const isSmallDisplay = useMemo(
    () => displayIn(width, SMALL_BREAKPOINTS),
    [width],
  );

  const buttonProps = useMemo(
    () => (isSmallDisplay ? undefined : { variant: 'outlined' }),
    [isSmallDisplay],
  );

  const noTokenIcon = useMemo(
    () => (
      isSmallDisplay
        ? <AccountCircle classes={{ root: classes.iconRoot }} />
        : null
    ),
    [classes.iconRoot, isSmallDisplay],
  );

  const signInActionForPlugin = useCallback(() => redirectToApp('/'), []);
  const redirectToWebAppAccount = useCallback(() => redirectToApp('/account'), []);

  return (
    <ButtonConnect
      noTokenIcon={noTokenIcon}
      buttonProps={buttonProps}
      signInAction={window.env.PLUGIN ? signInActionForPlugin : null}
      customAction={window.env.PLUGIN ? redirectToWebAppAccount : null}
      className={clsx(
        classes.buttonConnect,
        { [classes.buttonTextRounded]: !isSmallDisplay },
      )}
      {...props}
    />
  );
};

export default ButtonConnectMain;
