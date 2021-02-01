import React from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';
import dialogIsFullScreen from '@misakey/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FooterSso from '@misakey/react-auth/components/Footer/Sso';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

// CONSTANTS
const HALF_LARGE_MULTIPLIER = LARGE_MULTIPLIER / 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardRoot: ({ avatarLarge }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: avatarLarge ? AVATAR_SIZE * HALF_LARGE_MULTIPLIER : AVATAR_SIZE / 2,
    [dialogIsFullScreen(theme)]: {
      paddingTop: avatarLarge ? AVATAR_SM_SIZE * HALF_LARGE_MULTIPLIER : AVATAR_SM_SIZE / 2,
    },
  }),
  cardContent: {
    paddingBottom: 0,
  },
}));

// COMPONENTS
const CardSso = ({ avatarLarge, children, ...props }) => {
  const classes = useStyles({ avatarLarge });

  const fullScreen = useDialogFullScreen();

  return (
    <Container
      component={Box}
      height="100%"
      maxWidth="sm"
      disableGutters={fullScreen}
    >
      <Card
        classes={{ root: classes.cardRoot }}
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
  );
};

CardSso.propTypes = {
  avatarLarge: PropTypes.bool,
  children: PropTypes.node,
};

CardSso.defaultProps = {
  avatarLarge: false,
  children: null,
};

export default CardSso;
