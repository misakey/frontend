import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';

import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';

import routes from 'routes';

import Screen from 'components/dumb/Screen';

import 'components/screens/Citizen/Application/None/ApplicationNone.scss';

function ApplicationNone({ isAuthenticated, location, t, screenProps }) {
  const searchParam = getSearchParams(location.search).search;

  if (!isAuthenticated && isNil(searchParam)) {
    return <Redirect to={routes.landing} />;
  }

  return (
    <Screen {...screenProps}>
      <section id="ApplicationNone" className="section hide-exact">
        <Typography variant="h5" component="h3" align="center" color="textSecondary">
          {t('screens:application.none.title', 'Please select an application.')}
        </Typography>
      </section>
    </Screen>
  );
}

ApplicationNone.propTypes = {
  isAuthenticated: PropTypes.bool,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  t: PropTypes.func.isRequired,
  screenProps: PropTypes.object.isRequired,
};

ApplicationNone.defaultProps = {
  isAuthenticated: false,
};

export default connect(
  (state) => ({ isAuthenticated: !!state.auth.token }),
)(withTranslation(['common', 'screens'])(ApplicationNone));
