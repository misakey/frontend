import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Logo from '@misakey/ui/Logo';
import ButtonConnect from 'components/dumb/Button/Connect';
import Box from '@material-ui/core/Box';
import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import useAskToSetPassword from '@misakey/react/auth/hooks/useAskToSetPassword';

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
}));

// COMPONENTS
const CardOnboard = ({ t }) => {
  const classes = useStyles();

  const askToSetPassword = useAskToSetPassword();

  return (
    <Box mx={4} mb={4}>
      <Card elevation={0}>
        <CardActionArea
          draggable="false"
          className={classes.cardActionArea}
          onClick={askToSetPassword}
        >
          <Logo className={classes.logoRoot} />
          <TitleBold gutterBottom={false} align="center">
            {t('onboard:welcome')}
          </TitleBold>
          <Subtitle gutterBottom={false} align="center">
            {t('onboard:noAccount')}
          </Subtitle>
        </CardActionArea>
        <Box display="flex" flexDirection="column" flexShrink="0" mx={4} mt={2}>
          <ButtonConnect
            authProps={{ extraStateParams: { shouldCreateAccount: true } }}
            text={t('common:createAccount')}
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


export default withTranslation(['onboard', 'common'])(CardOnboard);
