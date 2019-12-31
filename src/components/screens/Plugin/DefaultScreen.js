import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Screen from 'components/dumb/Screen';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles(() => ({
  title: {
    fontFamily: '"Futura Std Bold"',
    opacity: '0.1',
  },
  container: {
    height: 'inherit',
  },
}));

// COMPONENTS
const DefaultScreen = ({ t }) => {
  const classes = useStyles();

  return (
    <Screen disableGutters>
      <Box className={classes.container} display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h3" className={classes.title} color="primary">
          {t('projectName', 'Misakey')}
        </Typography>

      </Box>
    </Screen>
  );
};

DefaultScreen.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common'])(DefaultScreen);
