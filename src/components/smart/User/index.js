import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import routes from 'routes';

import { makeStyles } from '@material-ui/core/styles';
import useWidth from '@misakey/hooks/useWidth';

import displayIn from '@misakey/helpers/displayIn';
import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import ButtonConnect from 'components/dumb/Button/Connect';
import AccountCircle from '@material-ui/icons/AccountCircle';

const SMALL_BREAKPOINTS = ['xs'];
const useStyles = makeStyles((theme) => ({
  buttonConnect: {
    flexShrink: '0',
    marginLeft: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      marginLeft: '0',
    },
    whiteSpace: 'nowrap',
  },
  buttonTextRounded: {
    borderRadius: '200px',
  },
  iconRoot: {
    width: '40px',
    height: '40px',
  },
}));

function User() {
  const classes = useStyles();
  const width = useWidth();

  const isSmallDisplay = useMemo(
    () => displayIn(width, SMALL_BREAKPOINTS),
    [width],
  );

  const buttonProps = useMemo(
    () => (isSmallDisplay ? undefined : { variant: 'outlined' }),
    [isSmallDisplay],
  );

  const noTokenIcon = useMemo(
    () => (isSmallDisplay ? <AccountCircle classes={{ root: classes.iconRoot }} /> : null),
    [classes.iconRoot, isSmallDisplay],
  );

  const signInActionForPlugin = useCallback(() => redirectToApp(routes.auth.redirectToSignIn), []);
  const redirectToWebAppAccount = useCallback(() => redirectToApp(routes.account._), []);

  return (
    <ButtonConnect
      noTokenIcon={noTokenIcon}
      buttonProps={buttonProps}
      signInAction={IS_PLUGIN ? signInActionForPlugin : null}
      customAction={IS_PLUGIN ? redirectToWebAppAccount : null}
      className={clsx(
        classes.buttonConnect,
        { [classes.buttonTextRounded]: !isSmallDisplay },
      )}
    />
  );
}

export default User;
