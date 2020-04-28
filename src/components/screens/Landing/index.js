import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Logo from 'components/dumb/Logo';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { Link, Redirect } from 'react-router-dom';

// HELPERS
const workspaceProp = prop('workspace');

const rootRouteProp = prop('_');

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
const Landing = ({ t, profile }) => {
  const classes = useStyles();

  const lastWorkspace = useMemo(
    () => workspaceProp(profile),
    [profile],
  );

  const redirectTo = useMemo(
    () => rootRouteProp(routes[lastWorkspace]),
    [lastWorkspace],
  );

  if (!isNil(redirectTo)) {
    return <Redirect to={redirectTo} />;
  }

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
  profile: PropTypes.shape({ workspace: PropTypes.string }),
  t: PropTypes.func.isRequired,
};

Landing.defaultProps = {
  profile: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

export default connect(mapStateToProps, {})(withTranslation('landing')(Landing));
