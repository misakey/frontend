import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';

import Logo from 'components/dumb/Logo';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import routes from 'routes';

// HOOKS
const useStyles = makeStyles((theme) => ({
  screen: {
    display: 'flex',
    height: '100vh',
    flexDirection: 'column',
  },
  mainBlock: {
    marginTop: 'auto',
    marginBottom: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  punchline: {
    margin: theme.spacing(3),
  },
  logo: {
    margin: theme.spacing(0, 3),
    maxWidth: '400px',
  },
  buttonGroup: {
    textAlign: 'center',
  },
  buttonGroupButton: {
    margin: theme.spacing(1, 2),
  },
  moreButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
}));

// COMPONENTS
const Landing = ({ t }) => {
  const classes = useStyles();

  return (
    <Box className={classes.screen}>
      <Box className={classes.mainBlock}>
        <Logo className={classes.logo} />
        <Typography variant="h5" align="center" className={classes.punchline}>
          {t('landing:punchline')}
        </Typography>
        <Box className={classes.buttonGroup}>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.buttonGroupButton}
            component={Link}
            to={routes.dpo._}
            size="large"
          >
            {t('landing:dpo')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={classes.buttonGroupButton}
            component={Link}
            to={routes.citizen._}
            size="large"
          >
            {t('landing:citizen')}
          </Button>
        </Box>
      </Box>
      <Box className={classes.moreButton}>
        <Button color="secondary" size="large" component="a" href={t('landing:moreLink')}>
          {t('landing:more')}
        </Button>
      </Box>
    </Box>
  );
};

Landing.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('landing')(Landing);
