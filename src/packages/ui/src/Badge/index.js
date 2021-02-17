import React, { useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import MuiBadge from '@material-ui/core/Badge';

// HOOKS
const useStyles = makeStyles((theme) => ({
  badge: {
    right: 3,
    top: 15,
    border: `2px solid ${theme.palette.background.default}`,
    padding: '0 4px',
  },
}));

// COMPONENTS
const Badge = ({ classes, ...props }) => {
  const internalClasses = useStyles();

  const { badge, ...restClasses } = useSafeDestr(classes);

  const mergedClasses = useMemo(
    () => ({
      badge: clsx(badge, internalClasses.badge),
      ...restClasses,
    }),
    [badge, internalClasses, restClasses],
  );

  return (
    <MuiBadge
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      classes={mergedClasses}
      color="primary"
      {...props}
    />
  );
};

Badge.propTypes = {
  classes: PropTypes.shape({
    badge: PropTypes.string,
  }),
};

Badge.defaultProps = {
  classes: {
    badge: '',
  },
};

export default Badge;
