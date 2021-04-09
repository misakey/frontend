import React, { useMemo } from 'react';
import { Redirect, Switch, useRouteMatch, useLocation } from 'react-router-dom';

import routes from 'routes';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations';

import isSelfOrg from 'helpers/isSelfOrg';
import isNil from '@misakey/core/helpers/isNil';
import getNextSearch from '@misakey/core/helpers/getNextSearch';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import { useSelector } from 'react-redux';
import useFetchOrganizations from 'hooks/useFetchOrganizations';

import OrganizationsReadSecret from 'components/screens/app/Organizations/Read/Secret';
import OrganizationsReadAgents from 'components/screens/app/Organizations/Read/Agents';
import RoutePasswordRequired from '@misakey/react/auth/components/Route/PasswordRequired';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

// COMPONENTS
const OrganizationsRead = () => {
  const { path } = useRouteMatch();
  const { search } = useLocation();

  const denormalizeOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );

  const orgId = useOrgId();
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));

  const { currentIdentityRole } = useSafeDestr(organization);

  const redirectToSecret = useGeneratePathKeepingSearchAndHash(routes.organizations.secret);

  const canAdmin = useMemo(
    () => !isSelfOrg(orgId) && currentIdentityRole === ADMIN,
    [currentIdentityRole, orgId],
  );

  // @FIXME make sure we don't flood call this hook
  const { organizations, shouldFetch, isFetching } = useFetchOrganizations();

  const organizationsReady = useMemo(
    () => !shouldFetch && !isFetching && !isNil(organizations),
    [isFetching, organizations, shouldFetch],
  );

  const organizationNotLinked = useMemo(
    () => organizationsReady && !organizations.some(({ id }) => orgId === id),
    [organizationsReady, organizations, orgId],
  );

  const selfOrgSearch = useMemo(
    () => getNextSearch(search, new Map([['orgId', undefined], ['datatagId', undefined]])),
    [search],
  );
  const redirectToSelfOrg = useGeneratePathKeepingSearchAndHash(
    routes.boxes._,
    undefined,
    selfOrgSearch,
  );

  return (
    <Switch>
      <RoutePasswordRequired
        path={path}
        render={() => (
          <>
            {!organizationsReady ? null : (
              <>
                {(organizationNotLinked || !canAdmin) ? (
                  <Redirect
                    from={path}
                    to={redirectToSelfOrg}
                  />
                ) : (
                  <Switch>
                    <RoutePasswordRequired
                      exact
                      path={routes.organizations.secret}
                      component={OrganizationsReadSecret}
                    />
                    <RoutePasswordRequired
                      exact
                      path={routes.organizations.agents}
                      component={OrganizationsReadAgents}
                    />
                    <Redirect
                      from={path}
                      to={redirectToSecret}
                    />
                  </Switch>
                )}
              </>
            )}
          </>
        )}
      />
    </Switch>
  );
};

export default OrganizationsRead;
