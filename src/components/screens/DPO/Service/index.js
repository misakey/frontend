import React, { useMemo } from 'react';
import routes from 'routes';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { WORKSPACE } from 'constants/workspaces';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

import ApplicationSchema from 'store/schemas/Application';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Container from '@material-ui/core/Container';
import useUserHasRole from '@misakey/hooks/useUserHasRole';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import withApplication from 'components/smart/withApplication';
import ActiveServices from 'components/smart/List/ActiveServices';

import Screen from 'components/dumb/Screen';
import ServiceClaim from 'components/screens/DPO/Service/Claim';
import ServiceRequests from 'components/screens/DPO/Service/Requests';
import Redirect from 'components/dumb/Redirect';
import BoxEllipsis from 'components/dumb/Box/Ellipsis';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import ServiceNotFound from 'components/screens/DPO/Service/NotFound';
import OnboardingDPO from 'components/dumb/Onboarding/DPO';
import SilentAuthScreen from 'components/dumb/Screen/SilentAuth';

// CONSTANTS
export const DPO_SERVICE_SCREEN_NAMES = {
  CLAIM: 'DPOServiceClaim',
  REQUESTS: 'DPOServiceRequests',
};

const DPO_WORKSPACE = WORKSPACE.DPO;

// HOOKS
const useStyles = makeStyles((theme) => ({
  burger: {
    // DRAWER spacing - BUTTONBURGER width+padding - APPBAR padding + EDGE margin
    marginRight: `calc(${theme.spacing(9) + 1}px - 48px - 24px + 12px)`,
  },
  avatarParent: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

// COMPONENTS
function Service({
  seclevel,
  entity,
  error,
  mainDomain,
  match,
  userId,
  isFetching,
  isAuthenticated,
  userRoles,
  userScope,
  ...rest
}) {
  const classes = useStyles();
  const claimRouteMatch = useRouteMatch(routes.dpo.service.claim._);
  const isClaimRoute = !isNil(claimRouteMatch);
  const requiredScope = useMemo(
    () => (isObject(entity) ? `${ROLE_PREFIX_SCOPE}.${DPO_WORKSPACE}.${entity.id}` : null),
    [entity],
  );
  const userIsConnectedAs = useMemo(
    () => (!isNil(userScope) && userScope.includes(requiredScope)),
    [requiredScope, userScope],
  );
  const userHasRole = useUserHasRole(userRoles, requiredScope);

  const withSearchBar = useMemo(
    () => seclevel !== 1, // we don't want dpo guests to use search feature for now
    [seclevel],
  );

  const shouldDisplayOnboarding = useMemo(
    () => (!isAuthenticated || (!userHasRole && !isClaimRoute)),
    [isAuthenticated, isClaimRoute, userHasRole],
  );

  const items = useMemo(
    () => (withSearchBar
      ? []
      : [(
        <BoxEllipsis className={classes.avatarParent} key="applicationAvatarParent">
          <ApplicationAvatar application={entity} />
        </BoxEllipsis>
      )]),
    [classes.avatarParent, entity, withSearchBar],
  );

  if (!isNil(error) && error.status === 404) {
    return <ServiceNotFound mainDomain={mainDomain} />;
  }

  if (userHasRole && !userIsConnectedAs) {
    return <SilentAuthScreen requiredScope={requiredScope} />;
  }

  if (shouldDisplayOnboarding) {
    return (
      <Screen appBarProps={{ withSearchBar, items }}>
        <Container maxWidth="md">
          <OnboardingDPO isAuthenticated={isAuthenticated} />
          <ActiveServices />
        </Container>
      </Screen>
    );
  }

  return (
    <Switch>
      <Route
        path={routes.dpo.service.claim._}
        render={(renderProps) => (
          <ServiceClaim
            appBarProps={{ withSearchBar, items }}
            isLoading={isFetching}
            name={DPO_SERVICE_SCREEN_NAMES.CLAIM}
            service={entity}
            userId={userId}
            userRoles={userRoles}
            error={error}
            {...rest}
            {...renderProps}
          />
        )}
      />
      <Route
        path={routes.dpo.service.requests._}
        render={(renderProps) => (
          <ServiceRequests
            appBarProps={{ withSearchBar, items }}
            isLoading={isFetching}
            name={DPO_SERVICE_SCREEN_NAMES.REQUESTS}
            service={entity}
            error={error}
            {...rest}
            {...renderProps}
          />
        )}
      />
      <Redirect
        exact
        from={match.path}
        to={routes.dpo.service.requests._}
      />
    </Switch>
  );
}

Service.propTypes = {
  // withApplication
  isAuthenticated: PropTypes.bool,
  userId: PropTypes.string,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // CONNECT
  seclevel: PropTypes.number,
  userScope: PropTypes.string,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })),
};

Service.defaultProps = {
  isFetching: false,
  seclevel: null,
  error: null,
  entity: null,
  userId: null,
  userScope: null,
  userRoles: [],
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  userRoles: state.auth.roles,
  userScope: state.auth.scope,
  seclevel: state.auth.acr,
});

export default connect(mapStateToProps)(withApplication(Service));
