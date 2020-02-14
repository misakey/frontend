import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation, Trans } from 'react-i18next';

import Title from 'components/dumb/Typography/Title';
import Screen from 'components/dumb/Screen';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    height: 'inherit',
    flexGrow: 1,
  },
  title: {
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
    width: '70%',
  },
  catchphrase: {
    fontSize: `calc(${theme.typography.h5.fontSize} + 1px)`,
    fontWeight: 'bold',
  },
}));

// COMPONENTS
const DefaultScreen = () => {
  const classes = useStyles();
  const appBarProps = useMemo(() => ({ withSearchBar: false }), []);

  return (
    <Screen appBarProps={appBarProps}>
      <Box className={classes.container} display="flex" justifyContent="center" alignItems="center">
        <Title className={classes.title}>
          <Trans i18nKey="plugin:invalidWebsite">
            <span className={classes.catchphrase}>Oups</span>
            {'L\'adresse détectée ne correspond pas à un site'}
          </Trans>
        </Title>
      </Box>
    </Screen>
  );
};

export default withTranslation(['plugin'])(DefaultScreen);
