import React, { useCallback, useMemo } from 'react';

import { Switch, Route, useRouteMatch, useHistory, useLocation } from 'react-router-dom';
import routes from 'routes';
import { notFound } from '@misakey/ui/constants/errorTypes';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import getNextSearch from '@misakey/helpers/getNextSearch';

import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import { useSelector } from 'react-redux';
import useOrgId from 'hooks/useOrgId';
import useDatatagId from 'hooks/useDatatagId';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import RouteAcr from '@misakey/react-auth/components/Route/Acr';
import BoxesContextProvider from 'components/smart/Context/Boxes';
import ScreenDrawerContextProvider from 'components/smart/Screen/Drawer';
import BoxesList from 'components/screens/app/Boxes/List';
import VaultLockedScreen from 'components/screens/app/VaultLocked';
import VaultDocuments from 'components/screens/app/Documents';
import Boxes from 'components/screens/app/Boxes';

// HOOKS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
function Home() {
  const { replace } = useHistory();
  const { search } = useLocation();
  const handleHttpErrors = useHandleHttpErrors();

  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  const ownerOrgId = useOrgId();
  const datatagId = useDatatagId();

  const noDatatagSearch = useMemo(
    () => getNextSearch(search, new Map([['datatagId', undefined]])),
    [search],
  );

  const filterId = useMemo(
    () => (isEmpty(datatagId) ? ownerOrgId : datatagId),
    [ownerOrgId, datatagId],
  );

  const queryParams = useMemo(
    () => (!isNil(ownerOrgId)
      ? { ownerOrgId, datatagId }
      : { datatagId }),
    [ownerOrgId, datatagId],
  );

  const onError = useCallback(
    (e) => {
      handleHttpErrors(e);
      if (e.code === notFound) {
        replace({ search: noDatatagSearch });
      }
    },
    [handleHttpErrors, replace, noDatatagSearch],
  );

  const matchNothingSelected = useRouteMatch({ path: routes.boxes._, exact: true });

  const isNothingSelected = useMemo(() => !isNil(matchNothingSelected), [matchNothingSelected]);

  const isFullWidth = useMemo(
    () => shouldDisplayLockedScreen || isNothingSelected,
    [shouldDisplayLockedScreen, isNothingSelected],
  );

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const drawerChildren = useMemo(
    () => {
      if (!isAuthenticated) {
        return null;
      }
      return shouldDisplayLockedScreen
        ? <VaultLockedScreen />
        : (
          <BoxesList
            filterId={filterId}
            queryParams={queryParams}
            onError={onError}
            isFullWidth={isFullWidth}
          />
        );
    },
    [isAuthenticated, shouldDisplayLockedScreen, filterId, queryParams, onError, isFullWidth],
  );

  return (
    <ScreenDrawerContextProvider
      drawerChildren={drawerChildren}
      isFullWidth={isFullWidth}
      initialIsDrawerOpen={isNothingSelected}
    >
      <BoxesContextProvider>
        <Switch>
          <RouteAcr
            acr={2}
            options={{ prompt: 'login' }}
            path={routes.documents._}
            component={VaultDocuments}
          />
          <Route
            path={routes.boxes._}
            component={Boxes}
          />
        </Switch>
      </BoxesContextProvider>
    </ScreenDrawerContextProvider>
  );
}

export default Home;
