import React, { useMemo } from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import RouteAcr from '@misakey/auth/components/Route/Acr';
import RouteAuthenticatedBoxRead from 'components/smart/Route/Authenticated/BoxRead';
import { UUID4_REGEX } from 'constants/regex';

import isNil from '@misakey/helpers/isNil';

import BoxesList from 'components/screens/app/Boxes/List';
import ScreenDrawer from 'components/smart/Screen/Drawer';

function Boxes({ match }) {
  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const { params: { id } } = useMemo(
    () => matchBoxSelected || { params: {} },
    [matchBoxSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);

  return (
    <Switch>
      <RouteAuthenticatedBoxRead
        path={routes.boxes.read._}
        render={(renderProps) => {
          if (!UUID4_REGEX.test(renderProps.match.params.id)) {
            return (
              <ScreenDrawer
                drawerChildren={(drawerProps) => <BoxesList {...drawerProps} />}
                initialIsDrawerOpen={isNothingSelected}
              >
                {(drawerProps) => (
                  <BoxNone {...drawerProps} {...renderProps} />
                )}
              </ScreenDrawer>
            );
          }
          return (
            <ScreenDrawer
              drawerChildren={(drawerProps) => <BoxesList {...drawerProps} />}
              initialIsDrawerOpen={isNothingSelected}
            >
              {(drawerProps) => (
                <BoxRead {...drawerProps} {...renderProps} />
              )}
            </ScreenDrawer>
          );
        }}
      />
      <RouteAcr
        acr={2}
        exact
        path={match.path}
        render={(renderProps) => (
          <ScreenDrawer
            drawerChildren={(drawerProps) => <BoxesList {...drawerProps} />}
            initialIsDrawerOpen={isNothingSelected}
          >
            {(drawerProps) => (
              <BoxNone {...drawerProps} {...renderProps} />
            )}
          </ScreenDrawer>
        )}
      />
    </Switch>
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Boxes;
