import React from 'react';
import PropTypes from 'prop-types';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FooterSso from '@misakey/react-auth/components/Footer/Sso';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

// HOOKS
const useStyles = makeStyles(() => ({
  cardContent: {
    paddingBottom: 0,
  },
}));

// COMPONENTS
const SigninRedirectCardSso = ({ children, ...props }) => {
  const classes = useStyles();

  const fullScreen = useDialogFullScreen();

  return (
    <Container
      component={Box}
      height="100%"
      maxWidth="sm"
      disableGutters={fullScreen}
    >
      <Card
        component={Box}
        height="100%"
        display="flex"
        flexDirection="column"
        pt={5}
        raised
        {...props}
      >
        <CardContent className={classes.cardContent}>
          <Box mb={3}>
            {children}
          </Box>
        </CardContent>
        <BoxFlexFill />
        <FooterSso />
      </Card>
    </Container>
  );
};

SigninRedirectCardSso.propTypes = {
  children: PropTypes.node,
};

SigninRedirectCardSso.defaultProps = {
  children: null,
};

export default SigninRedirectCardSso;
