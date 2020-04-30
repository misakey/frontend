import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Badge from '@material-ui/core/Badge';
import isNil from '@misakey/helpers/isNil';

// HOOKS
const useStyles = makeStyles(() => ({
  anchorOriginBottomRightRectangle: {
    bottom: 5,
    right: 5,
  },
}));

function BadgeForAvatar({ badgeContent, children, ...rest }) {
  const classes = useStyles();

  if (isNil(badgeContent)) {
    return children;
  }

  return (
    <Badge
      classes={{ anchorOriginBottomRightRectangle: classes.anchorOriginBottomRightRectangle }}
      badgeContent={badgeContent}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      {...rest}
    >
      {children}
    </Badge>
  );
}

BadgeForAvatar.propTypes = {
  badgeContent: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};

BadgeForAvatar.defaultProps = {
  badgeContent: null,
  children: null,
};

export default BadgeForAvatar;
