import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch } from 'react-router-dom';

import { ROLE_PREFIX_SCOPE } from 'constants/Roles';
import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useParseIdToken from '@misakey/hooks/useParseIdToken';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import useUserHasRole from '@misakey/hooks/useUserHasRole';

import withApplication from 'components/smart/withApplication';

import RouteService, { DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';
import ServiceClaim from 'components/screens/DPO/Service/Claim';
import ServiceRequests from 'components/screens/DPO/Service/Requests';
import Redirect from 'components/dumb/Redirect';
import SplashScreen from '@misakey/ui/Screen/Splash';
import BoxEllipsis from 'components/dumb/Box/Ellipsis';
import ApplicationAvatar from 'components/dumb/Avatar/Application';

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
  avatarParent: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

// COMPONENTS
function Service({
  entity, isDefaultDomain, mainDomain, match, userId, isFetching, userRoles, id, ...rest
}) {
  const classes = useStyles();

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

  const { acr } = useParseIdToken(id);
  const seclevel = useMemo(() => parseInt(acr, 10), [acr]);
  const withSearchBar = useMemo(
    () => seclevel !== 1, // we don't want dpo guests to use search feature for now
    [seclevel],
  );

  const items = useMemo(
    () => (withSearchBar
      ? []
      : [(
        <BoxEllipsis className={classes.avatarParent} key="applicationAvatarParent">
          <ApplicationAvatar application={service} />
        </BoxEllipsis>
      )]),
    [classes.avatarParent, service, withSearchBar],
  );

  if (isNil(service)) {
    return <SplashScreen />;
  }

  return (
    <Switch>
      <RouteService
        path={routes.dpo.service.claim._}
        component={ServiceClaim}
        componentProps={{
          appBarProps: { withSearchBar, items },
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
          appBarProps: { withSearchBar, items },
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
  );
}

Service.propTypes = {
  // withApplication
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  isDefaultDomain: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  userId: PropTypes.string,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
  // CONNECT
  id: PropTypes.string,
};

Service.defaultProps = {
  isFetching: false,
  entity: null,
  userId: null,
  id: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  id: state.auth.id,
});

export default withApplication(connect(mapStateToProps, {})(Service));
