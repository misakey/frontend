import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Card from 'components/dumb/Card';
import Footer from '@misakey/ui/Footer';

// CONSTANTS
const AUTH_MAX_WIDTH = 500;

const FOOTER_CONTAINER_PROPS = { mx: 2 };

// HOOKS
const useStyles = makeStyles((theme) => ({
  card: {
    maxWidth: AUTH_MAX_WIDTH,
    boxSizing: 'border-box',
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    borderBottom: 'none',
  },
  footer: {
    maxWidth: AUTH_MAX_WIDTH,
  },
}));

// COMPONENTS
const CardAuth = ({ className, children, footerProps, ...rest }) => {
  const classes = useStyles();

  return (
    <>
      <Card
        className={clsx(classes.card, className)}
        {...rest}
      >
        {children}
      </Card>
      <Footer className={classes.footer} containerProps={FOOTER_CONTAINER_PROPS} {...footerProps} />
    </>
  );
};

CardAuth.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  footerProps: PropTypes.object,
};

CardAuth.defaultProps = {
  className: '',
  children: null,
  footerProps: {},
};

export default CardAuth;
