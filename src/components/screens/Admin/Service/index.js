import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import withApplication from 'components/smart/withApplication';

import ResponseHandlerWrapper from 'components/dumb/ResponseHandlerWrapper';
import RouteService, { DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';
import Screen from 'components/dumb/Screen';
import NotFound from 'components/screens/NotFound';

import Drawer from 'components/screens/Admin/Service/Drawer';
import ServiceClaim from 'components/screens/Admin/Service/Claim';
import ServiceHome from 'components/screens/Admin/Service/Home';
import ServiceInformation from 'components/screens/Admin/Service/Information';
import ServiceSSO from 'components/screens/Admin/Service/SSO';
import ServiceUsers from 'components/screens/Admin/Service/Users';
import ServiceData from 'components/screens/Admin/Service/Data';
import useLocationWorkspace from 'hooks/useLocationWorkspace';

import 'components/screens/Admin/Service/Service.scss';

export const ADMIN_SERVICE_SCREEN_NAMES = {
  CLAIM: 'AdminServiceClaim',
  INFORMATION: 'AdminServiceInformation',
  SSO: 'AdminServiceSSO',
  USERS: 'AdminServiceUsers',
  DATA: 'AdminServiceData',
  HOME: 'AdminServiceHome',
};

function Service({ entity, error, isDefaultDomain, isFetching, mainDomain, match, userId }) {
  const service = useMemo(
    () => (isDefaultDomain ? DEFAULT_SERVICE_ENTITY : entity),
    [isDefaultDomain, entity],
  );
  const workspace = useLocationWorkspace();
  const requiredScope = useMemo(() => service && `rol.${workspace}.${service.id}`, [service, workspace]);
  const routeServiceProps = useMemo(
    () => ({ requiredScope, workspace, mainDomain }), [mainDomain, requiredScope, workspace],
  );

  return (
    <Screen className="Service">
      <ResponseHandlerWrapper
        error={error}
        entity={service}
        isFetching={isFetching}
      >
        <Drawer mainDomain={mainDomain}>
          <Switch>
            <RouteService
              path={routes.admin.service.claim._}
              component={ServiceClaim}
              componentProps={{ service, name: ADMIN_SERVICE_SCREEN_NAMES.CLAIM, userId }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.information._}
              component={ServiceInformation}
              componentProps={{ service, name: ADMIN_SERVICE_SCREEN_NAMES.INFORMATION }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.sso._}
              component={ServiceSSO}
              componentProps={{ service, name: ADMIN_SERVICE_SCREEN_NAMES.SSO }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.users._}
              component={ServiceUsers}
              componentProps={{ service, name: ADMIN_SERVICE_SCREEN_NAMES.USERS }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.data._}
              component={ServiceData}
              componentProps={{ service, name: ADMIN_SERVICE_SCREEN_NAMES.DATA }}
              {...routeServiceProps}
            />
            <RouteService
              exact
              path={routes.admin.service.home._}
              component={ServiceHome}
              componentProps={{ service, name: ADMIN_SERVICE_SCREEN_NAMES.HOME }}
              {...routeServiceProps}
            />
            <Route
              exact
              path={match.path}
              component={NotFound}
            />
          </Switch>
        </Drawer>
      </ResponseHandlerWrapper>
    </Screen>
  );
}

Service.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  error: PropTypes.object,
  isDefaultDomain: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  userId: PropTypes.string.isRequired,
};

Service.defaultProps = {
  entity: null,
  error: null,
  isFetching: true,
};

export default withApplication(Service);
