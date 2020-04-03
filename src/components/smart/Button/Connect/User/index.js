import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import routes from 'routes';

import { makeStyles } from '@material-ui/core/styles';
import useWidth from '@misakey/hooks/useWidth';

import displayIn from '@misakey/helpers/displayIn';
import { redirectToApp } from '@misakey/helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import ButtonConnect from 'components/dumb/Button/Connect';
import AvatarUser from '@misakey/ui/Avatar/User';

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
  buttonConnectIconButton: {
    marginRight: theme.spacing(-1.5),
  },
  buttonTextRounded: {
    borderRadius: '200px',
  },
}));

function ButtonConnectUser() {
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
    () => (isSmallDisplay ? <AvatarUser color="secondary" /> : null),
    [isSmallDisplay],
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
      classes={{ noToken: { iconButton: { root: classes.buttonConnectIconButton } } }}
    />
  );
}

export default ButtonConnectUser;
