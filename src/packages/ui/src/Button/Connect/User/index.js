import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import useWidth from '@misakey/hooks/useWidth';

import displayIn from '@misakey/helpers/displayIn';

import ButtonConnect from '@misakey/ui/Button/Connect';
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

const ButtonConnectUser = ({ component: Component, ...rest }) => {
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

  return (
    <Component
      noTokenIcon={noTokenIcon}
      buttonProps={buttonProps}
      className={clsx(
        classes.buttonConnect,
        { [classes.buttonTextRounded]: !isSmallDisplay },
      )}
      classes={{ noToken: { iconButton: { root: classes.buttonConnectIconButton } } }}
      {...rest}
    />
  );
};

ButtonConnectUser.propTypes = {
  component: PropTypes.elementType,
};

ButtonConnectUser.defaultProps = {
  component: ButtonConnect,
};

export default ButtonConnectUser;
