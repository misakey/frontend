import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';


// HOOKS
const useBoxStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  },
});

const DefaultSplashScreen = ({ t, text }) => {
  const classes = useBoxStyles();

  return (
    <Box className={classes.root}>
      <Container maxWidth="md">
        <Box mb={1}>
          <HourglassEmptyIcon fontSize="large" color="secondary" />
        </Box>
        <Typography variant="h5" component="h3" color="textSecondary">
          {text || t('common__new:loading')}
        </Typography>
      </Container>
    </Box>
  );
};

DefaultSplashScreen.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string,
};

DefaultSplashScreen.defaultProps = {
  text: null,
};

export default withTranslation('common__new')(DefaultSplashScreen);
