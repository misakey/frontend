import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import AccountRead from 'components/screens/app/Account/Read';
import AccountNone from 'components/screens/app/Account/None';

function Account({ match, ...props }) {
  return (
    <Switch>
      <Route
        path={routes.accounts._}
        render={(renderProps) => (
          <AccountRead {...props} {...renderProps} />
        )}
      />
      <Route
        exact
        path={match.path}
        render={(renderProps) => (
          <AccountNone {...props} {...renderProps} />
        )}
      />
    </Switch>
  );
}


Account.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};


Account.defaultProps = {
};

export default Account;
