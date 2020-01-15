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
  containerRoot: {
    height: '100%',
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
        <Box height="inherit" display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <LinkedApplicationsList />
            <ApplicationCategoriesList />
          </Box>
          <Footer />
        </Box>
      </Container>
    </Screen>
  );
};

export default LandingScreen;
