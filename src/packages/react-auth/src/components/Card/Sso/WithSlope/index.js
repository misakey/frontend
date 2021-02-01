import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ScreenSlope from '@misakey/ui/Screen/Slope';
import CardSso from '@misakey/react-auth/components/Card/Sso';

// HOOKS
const useStyles = makeStyles(() => ({
  screenContent: {
    flexGrow: 1,
  },
}));

// COMPONENTS
const CardSsoWithSlope = ({ avatar, avatarLarge, header, children, slopeProps, ...props }) => {
  const classes = useStyles();

  return (
    <ScreenSlope
      classes={{ content: classes.screenContent }}
      avatar={avatar}
      avatarLarge={avatarLarge}
      header={header}
      slopeProps={slopeProps}
      hideFooter
    >
      <CardSso
        avatarLarge
        {...props}
      >
        {children}
      </CardSso>
    </ScreenSlope>
  );
};

CardSsoWithSlope.propTypes = {
  avatar: PropTypes.node,
  avatarLarge: PropTypes.bool,
  header: PropTypes.node,
  children: PropTypes.node,
  slopeProps: PropTypes.object,
};

CardSsoWithSlope.defaultProps = {
  avatar: null,
  avatarLarge: false,
  header: null,
  children: null,
  slopeProps: {},
};

export default CardSsoWithSlope;
