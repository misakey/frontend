import { useMemo, useEffect, useCallback } from 'react';

import { useRouteMatch, useLocation, useHistory } from 'react-router-dom';

import routes from 'routes';

import isNil from '@misakey/core/helpers/isNil';
import isSelfOrg from 'helpers/isSelfOrg';
import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import getNextSearch from '@misakey/core/helpers/getNextSearch';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { useSelector } from 'react-redux';

const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
export default () => {
  const location = useLocation();
  const { search } = location;
  const matchBoxSelected = useRouteMatch({ path: routes.boxes.read._, exact: true });

  const isBoxSelected = useMemo(
    () => !isNil(matchBoxSelected),
    [matchBoxSelected],
  );

  const ownerOrgId = useOrgId();
  const history = useHistory();
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const isSelfOrgSelected = useMemo(
    () => isSelfOrg(ownerOrgId),
    [ownerOrgId],
  );

  const selfOrgSearch = useMemo(
    () => getNextSearch(search, new Map([['orgId', undefined], ['datatagId', undefined]])),
    [search],
  );

  const isReady = useMemo(
    () => !isSelfOrgSelected && !isBoxSelected,
    [isBoxSelected, isSelfOrgSelected],
  );

  const {
    organizations,
    isFetching,
    shouldFetch,
  } = useFetchOrganizations({ isReady });

  const checkAccessToOrg = useCallback(
    () => {
      const isMyOrg = organizations.some(({ id: orgId }) => ownerOrgId === orgId);
      if (!isMyOrg) {
        history.replace(selfOrgSearch);
      }
    },
    [history, organizations, ownerOrgId, selfOrgSearch],
  );

  const isOrgReady = useMemo(
    () => !isFetching && !shouldFetch && isAuthenticated,
    [isAuthenticated, isFetching, shouldFetch],
  );

  useEffect(
    () => {
      // user can join an org by joining a box he/she is datasubject
      // on box read view, no access is handled by NoAccessScreen
      if (isOrgReady && !isSelfOrgSelected && !isBoxSelected) {
        checkAccessToOrg();
      }
    },
    [isOrgReady, checkAccessToOrg, isBoxSelected, isSelfOrgSelected],
  );
};
