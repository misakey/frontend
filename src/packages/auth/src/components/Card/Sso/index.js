import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import ScreenSlope from '@misakey/ui/Screen/Slope';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FooterSso from '@misakey/auth/components/Footer/Sso';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

// HOOKS
const useStyles = makeStyles((theme) => ({
  screenContent: {
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'stretch',
    },
    justifyContent: 'center',
  },
  cardContent: {
    paddingBottom: 0,
  },
}));

// COMPONENTS
const CardSso = ({ avatar, avatarLarge, header, children, ...props }) => {
  const classes = useStyles();

  const fullScreen = useDialogFullScreen();

  return (
    <ScreenSlope
      classes={{ content: classes.screenContent }}
      avatar={avatar}
      avatarLarge={avatarLarge}
      header={header}
      hideFooter
    >
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
          square={fullScreen}
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
    </ScreenSlope>
  );
};

CardSso.propTypes = {
  avatar: PropTypes.node,
  avatarLarge: PropTypes.bool,
  header: PropTypes.node,
  children: PropTypes.node,
};

CardSso.defaultProps = {
  avatar: null,
  avatarLarge: false,
  header: null,
  children: null,
};

export default CardSso;
