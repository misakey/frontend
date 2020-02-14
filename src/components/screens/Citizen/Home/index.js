import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import LinkedApplicationsList from 'components/smart/List/LinkedApplications';
import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import Screen from 'components/dumb/Screen';
import { IS_PLUGIN } from 'constants/plugin';

// HOOKS
const useStyles = makeStyles(() => ({
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
    <Screen>
      <Container maxWidth="md" className={classes.container}>
        <Box>
          <LinkedApplicationsList />
          {!IS_PLUGIN && <ApplicationCategoriesList />}
        </Box>
      </Container>
    </Screen>
  );
};

export default CitizenHome;
