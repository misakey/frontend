import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import withApplication from 'components/smart/withApplication';

import ButtonBurger from 'components/dumb/Button/Burger';
import ResponseHandlerWrapper from 'components/dumb/ResponseHandlerWrapper';
import RouteService, { DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';
import NotFound from 'components/screens/NotFound';

import Drawer from 'components/screens/Admin/Service/Drawer';
import ServiceClaim from 'components/screens/Admin/Service/Claim';
import ServiceHome from 'components/screens/Admin/Service/Home';
import ServiceInformation from 'components/screens/Admin/Service/Information';
import ServiceSSO from 'components/screens/Admin/Service/SSO';
import ServiceUsers from 'components/screens/Admin/Service/Users';
import ServiceData from 'components/screens/Admin/Service/Data';
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import useUserHasRole from 'hooks/useUserHasRole';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

import 'components/screens/Admin/Service/Service.scss';

export const ADMIN_SERVICE_SCREEN_NAMES = {
  CLAIM: 'AdminServiceClaim',
  INFORMATION: 'AdminServiceInformation',
  SSO: 'AdminServiceSSO',
  USERS: 'AdminServiceUsers',
  DATA: 'AdminServiceData',
  HOME: 'AdminServiceHome',
};

function Service({
  entity,
  error,
  isDefaultDomain,
  isFetching,
  mainDomain,
  match,
  userId,
  userRoles,
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const service = useMemo(
    () => (isDefaultDomain ? DEFAULT_SERVICE_ENTITY : entity),
    [isDefaultDomain, entity],
  );

  const workspace = useLocationWorkspace();
  const requiredScope = useMemo(() => service && `${ROLE_PREFIX_SCOPE}.${workspace}.${service.id}`, [service, workspace]);
  const userHasRole = useUserHasRole(userRoles, requiredScope);
  const routeServiceProps = useMemo(
    () => ({ requiredScope, workspace, mainDomain, userHasRole }),
    [mainDomain, requiredScope, userHasRole, workspace],
  );

  const appBarProps = useMemo(() => ({
    shift: isDrawerOpen,
    leftItems: isDrawerOpen ? [] : [<ButtonBurger onClick={() => setDrawerOpen(true)} />],
  }), [isDrawerOpen, setDrawerOpen]);

  return (
    <div className="Service">
      <ResponseHandlerWrapper
        error={error}
        entity={service}
        isFetching={isFetching}
      >
        <Drawer
          mainDomain={mainDomain}
          open={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
          userHasRole={userHasRole}
        >
          <Switch>
            <RouteService
              path={routes.admin.service.claim._}
              component={ServiceClaim}
              componentProps={{
                appBarProps,
                service,
                name: ADMIN_SERVICE_SCREEN_NAMES.CLAIM,
                userId,
                userRoles,
              }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.information._}
              component={ServiceInformation}
              componentProps={{
                appBarProps,
                service,
                name: ADMIN_SERVICE_SCREEN_NAMES.INFORMATION,
              }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.sso._}
              component={ServiceSSO}
              componentProps={{
                appBarProps,
                service,
                name: ADMIN_SERVICE_SCREEN_NAMES.SSO,
              }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.users._}
              component={ServiceUsers}
              componentProps={{
                appBarProps,
                service,
                name: ADMIN_SERVICE_SCREEN_NAMES.USERS,
              }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.admin.service.data._}
              component={ServiceData}
              componentProps={{
                appBarProps,
                service,
                name: ADMIN_SERVICE_SCREEN_NAMES.DATA,
              }}
              {...routeServiceProps}
            />
            <RouteService
              exact
              path={routes.admin.service.home._}
              component={ServiceHome}
              componentProps={{
                appBarProps,
                service,
                name: ADMIN_SERVICE_SCREEN_NAMES.HOME,
              }}
              {...routeServiceProps}
            />
            <Route
              exact
              path={match.path}
              render={(routerProps) => <NotFound {...routerProps} appBarProps={appBarProps} />}
            />
          </Switch>
        </Drawer>
      </ResponseHandlerWrapper>
    </div>
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
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
};

Service.defaultProps = {
  entity: null,
  error: null,
  isFetching: true,
};

export default withApplication(Service);
