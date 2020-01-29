import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import LinkedApplicationsList from 'components/smart/List/LinkedApplications';
import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import Footer from 'components/dumb/Footer';
import Screen from 'components/dumb/Screen';

// HOOKS
const useStyles = makeStyles(() => ({
  screen: {
    display: 'flex',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

// COMPONENTS
const CitizenHome = () => {
  const classes = useStyles();

  return (
    <Screen className={classes.screen}>
      <Container maxWidth="md" className={classes.container}>
        <Box>
          <LinkedApplicationsList />
          <ApplicationCategoriesList />
        </Box>
        <Footer />
      </Container>
    </Screen>
  );
};

export default CitizenHome;
