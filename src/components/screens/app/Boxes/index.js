import React, { useMemo } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';
import { useSelector } from 'react-redux';

import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import { UUID4_REGEX } from 'constants/regex';

import isNil from '@misakey/helpers/isNil';

import BoxesList from 'components/screens/app/Boxes/List';
import ScreenDrawer from 'components/smart/Screen/Drawer';

import { selectors } from '@misakey/crypto/store/reducers';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import VaultLockedScreen from './VaultLocked';


function Boxes({ match }) {
  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const { params: { id } } = useMemo(
    () => matchBoxSelected || { params: {} },
    [matchBoxSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );

  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const shouldDisplayLockedScreen = useMemo(
    () => !isNil(accountId) && !isCryptoLoaded,
    [accountId, isCryptoLoaded],
  );
  const isFullWidth = useMemo(
    () => shouldDisplayLockedScreen,
    [shouldDisplayLockedScreen],
  );

  const drawerChildren = useMemo(() => {
    if (shouldDisplayLockedScreen) {
      return (drawerProps) => <VaultLockedScreen {...drawerProps} />;
    }
    return (drawerProps) => <BoxesList {...drawerProps} />;
  }, [shouldDisplayLockedScreen]);

  return (
    <ScreenDrawer
      drawerChildren={drawerChildren}
      isFullWidth={isFullWidth}
      initialIsDrawerOpen={isNothingSelected}
    >
      {(drawerProps) => (
        <Switch>
          <Route
            path={routes.boxes.read._}
            render={(renderProps) => {
              if (!UUID4_REGEX.test(renderProps.match.params.id)) {
                return <BoxNone {...drawerProps} {...renderProps} />;
              }
              return <BoxRead {...drawerProps} {...renderProps} />;
            }}
          />
          <Route
            exact
            path={match.path}
            render={(renderProps) => (
              <BoxNone {...drawerProps} {...renderProps} />
            )}
          />
        </Switch>
      )}
    </ScreenDrawer>
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Boxes;
