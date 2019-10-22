import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import BusinessIcon from '@material-ui/icons/Business';
// import routes from 'routes';
import Footer from 'components/dumb/Footer';
import InputSearchWithButton from 'components/dumb/Input/Search/WithButton';

import 'components/screens/Landing/landing.scss';

// CONSTANTS
const SEARCH_DARK = true;

// HELPERS
const getOnSearchChange = (setSearch) => ({ target: { value } }) => {
  setSearch(value);
};

const getOnSearchSubmit = (/* history */) => (value) => {
  const isLengthValid = value.length >= 3 || value.length === 0;

  if (isLengthValid) {
    // @FIXME go to list applications route
    // history.push({
    //   pathname: routes.citizen.?,
    //   search: `?search=${value}`,
    // });
  }
};

// HOOKS
const useStyles = makeStyles(() => ({
  title: {
    fontFamily: '"Futura Std Bold"',
  },
}));

const useOnSearchChange = (setSearch) => useMemo(
  () => getOnSearchChange(setSearch), [setSearch],
);

const useOnSearchSubmit = (history) => useMemo(
  () => getOnSearchSubmit(history), [history],
);

// COMPONENTS
const LandingScreen = ({ t, history }) => {
  const classes = useStyles();

  const [search, setSearch] = useState('');

  const onSearchChange = useOnSearchChange(setSearch);
  const onSearchSubmit = useOnSearchSubmit(history);

  return (
    <Container maxWidth={false} className="landing">
      <div className="flexWrapper">
        <div className="mainBlock">
          <Typography variant="h3" className={classes.title} color="secondary">
            {t('projectName', 'Misakey')}
          </Typography>
          <Typography className="subtitle">
            {t('screens:landing.search', 'Contacter les sites pour récupérer vos données')}
          </Typography>
          <div className="searchBlock">
            <InputSearchWithButton
              value={search}
              onChange={onSearchChange}
              onSubmit={onSearchSubmit}
              Icon={BusinessIcon}
              dark={SEARCH_DARK}
              iconButtonProps={{ disabled: search.length < 3 && search.length !== 0 }}
              autoFocus
            />
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
