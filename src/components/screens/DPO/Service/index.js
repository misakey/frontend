import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import withApplication from 'components/smart/withApplication';

import RouteService, { DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';

import ButtonBurger from 'components/dumb/Button/Burger';
import Drawer from 'components/screens/DPO/Service/Drawer';
import ServiceClaim from 'components/screens/DPO/Service/Claim';
import ServiceRequests from 'components/screens/DPO/Service/Requests';
import Redirect from 'components/dumb/Redirect';
import SplashScreen from 'components/dumb/SplashScreen';
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import useUserHasRole from 'hooks/useUserHasRole';

import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

// CONSTANTS
export const DPO_SERVICE_SCREEN_NAMES = {
  CLAIM: 'DPOServiceClaim',
  REQUESTS: 'DPOServiceRequests',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  burger: {
    // DRAWER spacing - BUTTONBURGER width+padding - APPBAR padding + EDGE margin
    marginRight: `calc(${theme.spacing(9) + 1}px - 48px - 24px + 12px)`,
  },
}));

// COMPONENTS
function Service({
  entity, isDefaultDomain, mainDomain, match, userId, isFetching, userRoles, ...rest
}) {
  const classes = useStyles();

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
    leftItems: [!isDrawerOpen ? (
      <ButtonBurger className={classes.burger} edge="start" key="ButtonBurger" onClick={() => setDrawerOpen(true)} />
    ) : null],
  }), [classes.burger, isDrawerOpen]);

  if (isNil(service)) {
    return <SplashScreen />;
  }

  return (
    <Drawer
      mainDomain={mainDomain}
      onClose={() => setDrawerOpen(false)}
      open={isDrawerOpen}
      userHasRole={userHasRole}
    >
      <Switch>
        <RouteService
          path={routes.dpo.service.claim._}
          component={ServiceClaim}
          componentProps={{
            appBarProps,
            isLoading: isFetching,
            name: DPO_SERVICE_SCREEN_NAMES.CLAIM,
            service,
            userId,
            userRoles,
            ...rest,
          }}
          {...routeServiceProps}
        />
        <RouteService
          path={routes.dpo.service.requests._}
          component={ServiceRequests}
          componentProps={{
            appBarProps,
            isLoading: isFetching,
            service,
            name: DPO_SERVICE_SCREEN_NAMES.REQUESTS,
            ...rest,
          }}
          {...routeServiceProps}
        />
        <Redirect
          from={match.path}
          to={routes.dpo.service.requests._}
        />
      </Switch>
    </Drawer>
  );
}

Service.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  isDefaultDomain: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  userId: PropTypes.string,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
};

Service.defaultProps = {
  entity: null,
  userId: null,
};

export default withApplication(Service);
