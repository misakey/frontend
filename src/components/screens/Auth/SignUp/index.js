import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';

import SignUp from 'components/smart/Auth/SignUp';
import DEFAULT_VALUES from 'components/smart/Auth/SignUp/values';

import Confirm from 'components/screens/Auth/SignUp/Confirm';

function AuthSignUp({ match }) {
  function ExactPath() {
    return <SignUp displayCard initialValues={{ ...DEFAULT_VALUES }} />;
  }

  return (
    <div id="AuthSignUp">
      <Switch>
        <Route path={routes.auth.signUp.confirm} component={Confirm} />
        <Route path={match.path} exact component={ExactPath} />
      </Switch>
    </div>
  );
}

AuthSignUp.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default AuthSignUp;
