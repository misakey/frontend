import React from 'react';
import PropTypes from 'prop-types';

import { SIZES, MEDIUM } from '@misakey/ui/constants/sizes';

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
const CardSsoWithSlope = ({ avatar, avatarSize, header, children, slopeProps, ...props }) => {
  const classes = useStyles();

  return (
    <ScreenSlope
      classes={{ content: classes.screenContent }}
      avatar={avatar}
      avatarSize={avatarSize}
      header={header}
      slopeProps={slopeProps}
      hideFooter
    >
      <CardSso
        avatarSize={avatarSize}
        {...props}
      >
        {children}
      </CardSso>
    </ScreenSlope>
  );
};

CardSsoWithSlope.propTypes = {
  avatar: PropTypes.node,
  avatarSize: PropTypes.oneOf(SIZES),
  header: PropTypes.node,
  children: PropTypes.node,
  slopeProps: PropTypes.object,
};

CardSsoWithSlope.defaultProps = {
  avatar: null,
  avatarSize: MEDIUM,
  header: null,
  children: null,
  slopeProps: {},
};

export default CardSsoWithSlope;
