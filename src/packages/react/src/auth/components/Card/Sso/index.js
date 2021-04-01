import React from 'react';
import PropTypes from 'prop-types';

import {
  AVATAR_SIZE, AVATAR_SM_SIZE,
  LARGE, SMALL, SIZES, MEDIUM,
  SMALL_AVATAR_SIZE, SMALL_AVATAR_SM_SIZE,
  LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';

import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FooterSso from '@misakey/react/auth/components/Footer/Sso';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardRoot: ({ avatarSize }) => {
    const notSizedProps = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    };
    if (avatarSize === LARGE) {
      return {
        ...notSizedProps,
        paddingTop: LARGE_AVATAR_SIZE / 2,
        [dialogIsFullScreen(theme)]: {
          paddingTop: LARGE_AVATAR_SM_SIZE / 2,
        },
      };
    }
    if (avatarSize === SMALL) {
      return {
        ...notSizedProps,
        paddingTop: SMALL_AVATAR_SIZE / 2,
        [dialogIsFullScreen(theme)]: {
          paddingTop: SMALL_AVATAR_SM_SIZE / 2,
        },
      };
    }
    return {
      ...notSizedProps,
      paddingTop: AVATAR_SIZE / 2,
      [dialogIsFullScreen(theme)]: {
        paddingTop: AVATAR_SM_SIZE / 2,
      },
    };
  },
  cardContent: {
    paddingBottom: 0,
  },
}));

// COMPONENTS
const CardSso = ({ avatarSize, children, ...props }) => {
  const classes = useStyles({ avatarSize });

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
  avatarSize: PropTypes.oneOf(SIZES),
  children: PropTypes.node,
};

CardSso.defaultProps = {
  avatarSize: MEDIUM,
  children: null,
};

export default CardSso;
