import React, { useCallback, useContext } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Logo from '@misakey/ui/Logo';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';

// HOOKS
const useStyles = makeStyles((theme) => ({
  logoRoot: {
    margin: theme.spacing(4, 1, 3, 1),
    padding: theme.spacing(1, 0),
  },
  cardActionArea: {
    borderRadius: theme.shape.borderRadius,
    userSelect: 'text',
  },
  title: {
    flexGrow: 1,
    fontWeight: 'bold',
  },
}));

// COMPONENTS
const CardOnboard = ({ t }) => {
  const classes = useStyles();

  const { askSigninRedirect } = useContext(UserManagerContext);

  const onCreateAccount = useCallback(
    () => askSigninRedirect({ acrValues: 2, prompt: 'login' }),
    [askSigninRedirect],
  );

  return (
    <Box mx={4} mb={4}>
      <Card elevation={0}>
        <CardActionArea
          draggable="false"
          className={classes.cardActionArea}
          onClick={onCreateAccount}
        >
          <Logo className={classes.logoRoot} />
          <Typography variant="h6" className={classes.title} color="textPrimary" align="center">
            {t('onboard:welcome')}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center">
            {t('onboard:noAccount')}
          </Typography>
        </CardActionArea>
        <Box display="flex" flexDirection="column" flexShrink="0" mx={4} mt={2}>
          <Button
            standing={BUTTON_STANDINGS.MAIN}
            text={t('onboard:createAccount')}
            onClick={onCreateAccount}
          />
        </Box>
      </Card>
    </Box>
  );
};

CardOnboard.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};


export default withTranslation('onboard')(CardOnboard);
