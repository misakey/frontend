import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';

import LinkedApplicationsList from 'components/smart/List/LinkedApplications';
import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import Footer from 'components/dumb/Footer';
import Screen from 'components/dumb/Screen';

import 'components/screens/Landing/landing.scss';

// HOOKS
const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
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
const LandingScreen = () => {
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
            <LinkedApplicationsList />
            <ApplicationCategoriesList />
          </div>
          <Footer />
        </div>
      </Container>
    </Screen>
  );
};

export default LandingScreen;
