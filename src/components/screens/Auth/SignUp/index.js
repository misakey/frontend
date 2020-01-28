import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';

import Create from 'components/screens/Auth/SignUp/Create';
import Confirm from 'components/screens/Auth/SignUp/Confirm';
import Finale from 'components/screens/Auth/SignUp/Finale';

function AuthSignUp({ match }) {
  return (
    <div id="AuthSignUp">
      <Switch>
        <Route exact path={routes.auth.signUp.confirm} component={Confirm} />
        <Route exact path={routes.auth.signUp.finale} component={Finale} />
        <Route
          path={match.path}
          render={(routerProps) => <Create {...routerProps} />}
        />
      </Switch>
    </div>
  );
}

AuthSignUp.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default AuthSignUp;
