import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Container from '@material-ui/core/Container';
import Footer from '@misakey/ui/Footer';

// CONSTANTS
const CONTAINER_PROPS = {
  maxWidth: false,
};

// HOOKS
const useStyles = makeStyles(() => ({
  footer: {
    border: 'none',
    alignSelf: 'stretch',
  },
}));

// COMPONENTS
const FooterSso = (props) => {
  const classes = useStyles();

  return (
    <Footer
      className={classes.footer}
      ContainerComponent={Container}
      containerProps={CONTAINER_PROPS}
      square
      {...props}
    />

  );
};

export default FooterSso;
