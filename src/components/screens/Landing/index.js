import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Footer from 'components/dumb/Footer';
import Screen from 'components/dumb/Screen';
import Title from 'components/dumb/Typography/Title';

import 'components/screens/Landing/landing.scss';

// HOOKS
const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
  },
  containerRoot: {
    height: '100%',
  },
  content: {
    height: 'inherit',
    display: 'flex',
    flexDirection: 'column',
  },
  searchButtonRoot: {
    borderRadius: '200px',
    height: `calc(${theme.typography.h2.lineHeight} * ${theme.typography.h2.fontSize})`,
  },
  searchButtonLabel: {
    textTransform: 'none',
  },
  searchButtonEndIcon: {
    marginLeft: 'auto',
  },
}));

// COMPONENTS
const LandingScreen = ({ t }) => {
  const classes = useStyles();

  return (
    <Screen
      fullHeight
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Container maxWidth="md" classes={{ root: classes.containerRoot }}>
        <div className={classes.content}>
          <div className={classes.body}>
            <Box mb={3}>
              <Title align="center">
                {t('screens:landing.subtitle')}
              </Title>
            </Box>
          </div>
          <Footer />
        </div>
      </Container>
    </Screen>
  );
};
LandingScreen.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withTranslation(['common', 'screens'])(LandingScreen);
