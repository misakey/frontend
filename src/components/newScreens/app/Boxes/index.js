import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import BoxRead from 'components/newScreens/app/Boxes/Read';
import BoxNone from 'components/newScreens/app/Boxes/None';

function Boxes({ match, ...props }) {
  return (
    <Switch>
      <Route
        path={routes.boxes.read._}
        render={(renderProps) => (
          <BoxRead {...props} {...renderProps} />
        )}
      />
      <Route
        exact
        path={match.path}
        render={(renderProps) => (
          <BoxNone {...props} {...renderProps} />
        )}
      />
    </Switch>
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Boxes;
