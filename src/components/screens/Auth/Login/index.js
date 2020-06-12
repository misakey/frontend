import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import routes from 'routes';


import isEmpty from '@misakey/helpers/isEmpty';

import { Route, Switch, Redirect } from 'react-router-dom';
import LoginIdentifier from 'components/screens/Auth/Login/Identifier';
import LoginSecret from 'components/screens/Auth/Login/Secret';

// HELPERS

// COMPONENTS
const AuthLogin = ({ identifier, match, ...props }) => (
  <Switch>
    {isEmpty(identifier)
      && <Redirect exact from={routes.auth.signIn.secret} to={routes.auth.signIn._} />}
    <Route
      exact
      path={routes.auth.signIn.secret}
      render={(routerProps) => (
        <LoginSecret
          identifier={identifier}
          {...routerProps}
          {...props}
        />
      )}
    />
    <Route
      path={match.path}
      render={(routerProps) => (
        <LoginIdentifier
          identifier={identifier}
          {...routerProps}
          {...props}
        />
      )}
    />
  </Switch>
);

AuthLogin.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  // CONNECT
  identifier: PropTypes.string,
  // ROUTER
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AuthLogin.defaultProps = {
  identifier: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.screens.auth.identifier,
});

export default connect(mapStateToProps, {})(withTranslation('auth')(AuthLogin));
