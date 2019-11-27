import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import withApplication from 'components/smart/withApplication';

import ResponseHandlerWrapper from 'components/dumb/ResponseHandlerWrapper';
import RouteService, { DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';
import Screen from 'components/dumb/Screen';
import Redirect from 'components/dumb/Redirect';

import Drawer from 'components/screens/DPO/Service/Drawer';
import ServiceClaim from 'components/screens/DPO/Service/Claim';
import ServiceRequests from 'components/screens/DPO/Service/Requests';
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import useUserHasRole from 'hooks/useUserHasRole';

import 'components/screens/DPO/Service/Service.scss';


export const DPO_SERVICE_SCREEN_NAMES = {
  CLAIM: 'DPOServiceClaim',
  REQUESTS: 'DPOServiceRequests',
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
  const service = useMemo(
    () => (isDefaultDomain ? DEFAULT_SERVICE_ENTITY : entity),
    [isDefaultDomain, entity],
  );
  const workspace = useLocationWorkspace();
  const requiredScope = useMemo(() => entity && `rol.${workspace}.${entity.id}`, [entity, workspace]);
  const userHasRole = useUserHasRole(userRoles, requiredScope);
  const routeServiceProps = useMemo(
    () => ({ requiredScope, workspace, mainDomain, userHasRole }),
    [mainDomain, requiredScope, userHasRole, workspace],
  );

  return (
    <Screen className="Service">
      <ResponseHandlerWrapper
        error={error}
        entity={service}
        isFetching={isFetching}
      >
        <Drawer mainDomain={mainDomain} userHasRole={userHasRole}>
          <Switch>
            <RouteService
              path={routes.dpo.service.claim._}
              component={ServiceClaim}
              componentProps={{ service, name: DPO_SERVICE_SCREEN_NAMES.CLAIM, userId, userRoles }}
              {...routeServiceProps}
            />
            <RouteService
              path={routes.dpo.service.requests._}
              component={ServiceRequests}
              componentProps={{
                service,
                name: DPO_SERVICE_SCREEN_NAMES.REQUESTS,
                routeProps: routeServiceProps,
              }}
              {...routeServiceProps}
            />
            <Redirect
              from={match.path}
              to={routes.dpo.service.requests._}
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
