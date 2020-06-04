import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Container from '@material-ui/core/Container';
import Footer from 'components/dumb/Footer';
import Box from '@material-ui/core/Box';

// CONSTANTS
const CONTAINER_PROPS = {
  maxWidth: false,
};

// HOOKS
const useStyles = makeStyles(() => ({
  footer: {
    borderLeft: 'none',
    borderRight: 'none',
  },
}));

// COMPONENTS
const FooterFullScreen = (props) => {
  const classes = useStyles();

  return (
    <Box mt={2} width="100%">
      <Footer
        className={classes.footer}
        ContainerComponent={Container}
        containerProps={CONTAINER_PROPS}
        square
        {...props}
      />
    </Box>
  );
};

export default FooterFullScreen;
