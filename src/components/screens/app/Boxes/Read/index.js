import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import BoxesSchema from 'store/schemas/Boxes';
import IdentitySchema from 'store/schemas/Identity';

import withIdentity from 'components/smart/withIdentity';
import withBoxDetails from 'components/smart/withBoxDetails';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';


function BoxRead({
  match, toggleDrawer, isDrawerOpen, drawerWidth, box, isFetching, identity, isFetchingIdentity,
}) {
  if (isFetching.box || isFetchingIdentity || identity === null) {
    return <SplashScreenWithTranslation />;
  }

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
              isFetching={isFetching.events}
              identity={identity}
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
  box: PropTypes.shape(BoxesSchema.propTypes),
  isFetching: PropTypes.shape({
    box: PropTypes.bool.isRequired,
    events: PropTypes.bool.isRequired,
  }),
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,

  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetchingIdentity: PropTypes.bool.isRequired,
};

BoxRead.defaultProps = {
  isDrawerOpen: false,
  isFetching: {
    box: false,
    events: false,
  },
  box: null,
  identity: null,
};

export default withBoxDetails()(withIdentity(BoxRead));
