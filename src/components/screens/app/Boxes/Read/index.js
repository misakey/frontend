import React, { useMemo } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import BoxesSchema from 'store/schemas/Boxes';

import withBoxDetails from 'components/smart/withBoxDetails';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

import { CLOSED } from 'constants/app/boxes/statuses';

import BoxClosed from './Closed';
import BoxDetails from './Details';
import BoxEvents from './Events';
import BoxFiles from './Files';


function BoxRead({
  match, toggleDrawer, isDrawerOpen, drawerWidth, box, isFetching, belongsToCurrentUser,
}) {
  const { lifecycle } = useMemo(() => box, [box]);
  const shouldDisplayContent = useMemo(
    () => lifecycle === CLOSED && !belongsToCurrentUser,
    [belongsToCurrentUser, lifecycle],
  );

  if (isFetching.box) {
    return <SplashScreenWithTranslation />;
  }

  if (shouldDisplayContent) {
    return (
      <BoxClosed
        box={box}
        toggleDrawer={toggleDrawer}
        isDrawerOpen={isDrawerOpen}
        drawerWidth={drawerWidth}
      />
    );
  }

  return (
    <>
      <Switch>
        <Route
          path={routes.boxes.read.details}
          render={() => (
            <BoxDetails
              box={box}
              drawerWidth={drawerWidth}
              belongsToCurrentUser={belongsToCurrentUser}
            />
          )}
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
  belongsToCurrentUser: PropTypes.bool.isRequired,
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

BoxRead.defaultProps = {
  isDrawerOpen: false,
  isFetching: {
    box: false,
    events: false,
  },
  box: null,
};

export default withBoxDetails()(BoxRead);
