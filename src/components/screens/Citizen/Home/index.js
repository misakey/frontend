import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import SearchApplications from 'components/smart/Search/Applications';
import LinkedApplicationsList from 'components/smart/List/LinkedApplications';
import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import Screen from 'components/dumb/Screen';
import { IS_PLUGIN } from 'constants/plugin';

// CONSTANTS
const POPOVER_PROPS = {
  fixedHeight: true,
};
const FOOTER_PROPS = {
  FABPadded: true,
};

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
    <Screen footerProps={FOOTER_PROPS}>
      <Container maxWidth="md" className={classes.container}>
        <Box>
          <LinkedApplicationsList />
          {!IS_PLUGIN && <ApplicationCategoriesList />}
        </Box>
      </Container>
      <SearchApplications popoverProps={POPOVER_PROPS} />
    </Screen>
  );
};

export default CitizenHome;
