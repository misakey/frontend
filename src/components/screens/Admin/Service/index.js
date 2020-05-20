/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import withApplication from 'components/smart/withApplication';

import ButtonBurger from '@misakey/ui/Button/Burger';
import NotFound from 'components/screens/NotFound';

import isNil from '@misakey/helpers/isNil';
import Drawer from 'components/screens/Admin/Service/Drawer';
import ServiceClaim from 'components/screens/Admin/Service/Claim';
import ServiceHome from 'components/screens/Admin/Service/Home';
import ServiceInformation from 'components/screens/Admin/Service/Information';
import ServiceSSO from 'components/screens/Admin/Service/SSO';
import ServiceUsers from 'components/screens/Admin/Service/Users';
import ServiceData from 'components/screens/Admin/Service/Data';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import useUserHasRole from '@misakey/hooks/useUserHasRole';
import SilentAuthScreen from 'components/dumb/Screen/SilentAuth';
import Screen from 'components/dumb/Screen';
import Title from 'components/dumb/Typography/Title';
import Container from '@material-ui/core/Container';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

import 'components/screens/Admin/Service/Service.scss';
import { connect } from 'react-redux';
import Redirect from 'components/dumb/Redirect';
import generatePath from 'packages/helpers/src/generatePath';
import { withTranslation } from 'react-i18next';

export const ADMIN_SERVICE_SCREEN_NAMES = {
  CLAIM: 'AdminServiceClaim',
  INFORMATION: 'AdminServiceInformation',
  SSO: 'AdminServiceSSO',
  USERS: 'AdminServiceUsers',
  DATA: 'AdminServiceData',
  HOME: 'AdminServiceHome',
};

export const DEFAULT_DOMAIN = 'intro';
export const DEFAULT_SERVICE_ENTITY = { mainDomain: DEFAULT_DOMAIN };

function Service({
  entity,
  // error,
  isDefaultDomain,
  // isFetching,
  mainDomain,
  match,
  isAuthenticated,
  userId,
  userRoles,
  userScope,
  t,
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const claimRouteMatch = useRouteMatch(routes.admin.service.claim._);
  const isClaimRoute = !isNil(claimRouteMatch);
  const service = useMemo(
    () => (isNil(entity) ? DEFAULT_SERVICE_ENTITY : entity),
    [isDefaultDomain, entity],
  );

  const workspace = useLocationWorkspace();
  const requiredScope = useMemo(() => (service && service.id ? `${ROLE_PREFIX_SCOPE}.${workspace}.${service.id}` : null), [service, workspace]);
  const userHasRole = useUserHasRole(userRoles, requiredScope);
  const userIsConnectedAs = useMemo(
    () => (!isNil(userScope) && userScope.includes(requiredScope)),
    [requiredScope, userScope],
  );

  const redirectToClaim = useMemo(
    () => (!isAuthenticated || (!userHasRole && !isClaimRoute)),
    [isAuthenticated, isClaimRoute, userHasRole],
  );

  const claimApplicationRoute = useMemo(
    () => generatePath(routes.admin.service.claim._, { mainDomain: service.mainDomain }),
    [],
  );

  const appBarProps = useMemo(() => ({
    shift: isDrawerOpen,
    leftItems: isDrawerOpen ? [] : [<ButtonBurger onClick={() => setDrawerOpen(true)} />],
  }), [isDrawerOpen, setDrawerOpen]);

  const routeProps = useMemo(() => ({
    appBarProps,
    service,
  }), []);

  if (mainDomain === DEFAULT_DOMAIN) {
    return (
      <Screen
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Container maxWidth="md">
          <Title align="center">{t(`components:route.service.intro.${workspace}.description`)}</Title>
        </Container>
      </Screen>
    );
  }

  if (redirectToClaim) {
    return <Redirect to={claimApplicationRoute} />;
  }

  if (userHasRole && !userIsConnectedAs) {
    return <SilentAuthScreen requiredScope={requiredScope} />;
  }

  return (
    <div className="Service">
      <Drawer
        mainDomain={mainDomain}
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        userHasRole={userHasRole}
      >
        <Switch>
          <Route
            path={routes.admin.service.claim._}
            render={(renderProps) => (
              <ServiceClaim
                appBarProps={appBarProps}
                service={service}
                name={ADMIN_SERVICE_SCREEN_NAMES.CLAIM}
                userId={userId}
                userRoles={userRoles}
                {...renderProps}
              />
            )}
          />
          <Route
            path={routes.admin.service.information._}
            render={(renderProps) => (
              <ServiceInformation
                name={ADMIN_SERVICE_SCREEN_NAMES.INFORMATION}
                {...routeProps}
                {...renderProps}
              />
            )}
          />
          <Route
            path={routes.admin.service.sso._}
            render={(renderProps) => (
              <ServiceSSO
                name={ADMIN_SERVICE_SCREEN_NAMES.SSO}
                {...routeProps}
                {...renderProps}
              />
            )}
          />
          <Route
            path={routes.admin.service.users._}
            render={(renderProps) => (
              <ServiceUsers
                name={ADMIN_SERVICE_SCREEN_NAMES.USERS}
                {...routeProps}
                {...renderProps}
              />
            )}
          />
          <Route
            path={routes.admin.service.data._}
            render={(renderProps) => (
              <ServiceData
                name={ADMIN_SERVICE_SCREEN_NAMES.DATA}
                {...routeProps}
                {...renderProps}
              />
            )}
          />
          <Route
            exact
            path={routes.admin.service.home._}
            component={ServiceHome}
            {...{
              appBarProps,
              service,
              name: ADMIN_SERVICE_SCREEN_NAMES.HOME,
            }}
          />
          <Route
            exact
            path={match.path}
            render={(routerProps) => <NotFound {...routerProps} appBarProps={appBarProps} />}
          />
        </Switch>
      </Drawer>
    </div>
  );
}

Service.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  error: PropTypes.object,
  isDefaultDomain: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  isAuthenticated: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  userScope: PropTypes.string.isRequired,
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


// CONNECT
const mapStateToProps = (state) => ({
  userScope: state.auth.scope,
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(withApplication(withTranslation('components')(Service)));
