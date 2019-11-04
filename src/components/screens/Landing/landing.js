import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import BusinessIcon from '@material-ui/icons/Business';
import SearchIcon from '@material-ui/icons/Search';
import routes from 'routes';
import Footer from 'components/dumb/Footer';
import Button from '@material-ui/core/Button';

import 'components/screens/Landing/landing.scss';

// HOOKS
const useStyles = makeStyles((theme) => ({
  title: {
    fontFamily: '"Futura Std Bold"',
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
const LandingScreen = ({ t }) => {
  const classes = useStyles();

  const to = useMemo(
    () => {
      const search = new URLSearchParams();
      search.set('search', '');
      return {
        pathname: routes.citizen.applications,
        search: search.toString(),
      };
    },
    [],
  );

  return (
    <Container maxWidth={false} className="landing">
      <div className="flexWrapper">
        <div className="mainBlock">
          <Typography variant="h3" className={classes.title} color="secondary">
            {t('projectName', 'Misakey')}
          </Typography>
          <Typography className="subtitle">
            {t('screens:landing.subtitle', 'Contacter les sites pour récupérer vos données')}
          </Typography>
          <div className="searchBlock">
            <Button
              component={Link}
              to={to}
              color="primary"
              variant="outlined"
              size="large"
              fullWidth
              classes={{
                root: classes.searchButtonRoot,
                label: classes.searchButtonLabel,
                endIcon: classes.searchButtonEndIcon,
              }}
              startIcon={<BusinessIcon />}
              endIcon={<SearchIcon />}
            >
              {t('screens:landing.search.placeholder')}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </Container>
  );
};
LandingScreen.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withTranslation(['common', 'screens'])(LandingScreen);
