import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';


function BoxRead({ match, toggleDrawer, isDrawerOpen, drawerWidth }) {
  const box = { id: match.params.id };
  return (
    <>
      <Switch>
        <Route
          path={routes.boxes.read.details}
          render={() => <BoxDetails box={box} drawerWidth={drawerWidth} />}
        />
        <Route
          path={routes.boxes.read.files}
          render={() => <BoxFiles box={box} drawerWidth={drawerWidth} />}
        />
        <Route
          exact
          path={match.path}
          render={() => (
            <BoxEvents
              box={box}
              toggleDrawer={toggleDrawer}
              isDrawerOpen={isDrawerOpen}
              drawerWidth={drawerWidth}
            />
          )}
        />
      </Switch>
    </>

  );
}

BoxRead.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  // withBoxDetails
  box: PropTypes.shape({ id: PropTypes.string.isRequired }),
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

BoxRead.defaultProps = {
  isDrawerOpen: false,
  box: null,
};

export default BoxRead;
