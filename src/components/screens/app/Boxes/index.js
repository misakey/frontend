import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import { UUID4_REGEX } from 'constants/regex';

function Boxes({ match, ...props }) {
  return (
    <Switch>
      <Route
        path={routes.boxes.read._}
        render={(renderProps) => {
          if (!UUID4_REGEX.test(renderProps.match.params.id)) {
            return <BoxNone {...props} {...renderProps} />;
          }
          return <BoxRead {...props} {...renderProps} />;
        }}
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
