import React, { forwardRef } from 'react';

import clsx from 'clsx';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  typographyRoot: {
    display: 'flex',
    alignItems: 'center',
    '&::before,&::after': {
      content: "''",
      flexGrow: 1,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '&::before': {
      marginRight: theme.spacing(2),
    },
    '&::after': {
      marginLeft: theme.spacing(2),
    },
  },
}));

// COMPONENTS
const TypographySeparator = forwardRef(({ children, className, ...props }, ref) => {
  const classes = useStyles();

  return (
    <Typography
      ref={ref}
      align="center"
      color="textPrimary"
      className={clsx(classes.typographyRoot, className)}
      {...props}
    >
      {children}
    </Typography>
  );
});

TypographySeparator.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TypographySeparator.defaultProps = {
  className: '',
};

export default TypographySeparator;
