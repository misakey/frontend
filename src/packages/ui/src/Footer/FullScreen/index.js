import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Container from '@material-ui/core/Container';
import Footer from '@misakey/ui/Footer';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

// CONSTANTS
const CONTAINER_PROPS = {
  maxWidth: false,
};

// HOOKS
const useStyles = makeStyles(() => ({
  footer: {
    borderLeft: 'none',
    borderRight: 'none',
    alignSelf: 'stretch',
  },
}));

// COMPONENTS
const FooterFullScreen = (props) => {
  const classes = useStyles();

  return (
    <>
      <BoxFlexFill />
      <Footer
        className={classes.footer}
        ContainerComponent={Container}
        containerProps={CONTAINER_PROPS}
        square
        {...props}
      />
    </>

  );
};

export default FooterFullScreen;
