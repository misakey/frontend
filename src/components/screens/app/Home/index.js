import React, { useMemo, Suspense } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import routes from 'routes';
import isNil from '@misakey/helpers/isNil';

import AccountList from 'components/screens/app/Account/List';
import BoxesList from 'components/screens/app/Boxes/List';
import IdentifierDrawer from 'components/screens/app/Identifiers/Drawer';
import ScreenDrawer from 'components/smart/Screen/Drawer';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

import Boxes from 'components/screens/app/Boxes';
import Accounts from 'components/screens/app/Account';

function Home(props) {
  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const matchAccountSelected = useRouteMatch(routes.accounts._);
  const { params: { id } } = useMemo(
    () => matchBoxSelected || matchAccountSelected || { params: {} },
    [matchAccountSelected, matchBoxSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);

  const drawerChildren = useMemo(
    () => ({
      account: (drawerProps) => <IdentifierDrawer {...drawerProps} />,
      default: (drawerProps) => (
        <Suspense fallback={<SplashScreenWithTranslation />}>
          <Switch>
            <Route
              path={routes.accounts._}
              render={(renderProps) => (
                <AccountList {...drawerProps} {...renderProps} />
              )}
            />
            <Route
              path={routes.boxes._}
              render={(renderProps) => (
                <BoxesList {...drawerProps} {...renderProps} />
              )}
            />
          </Switch>
        </Suspense>
      ),
    }),
    [],
  );

  return (
    <ScreenDrawer drawerChildren={drawerChildren} isFullWidth={isNothingSelected} {...props}>
      {(drawerProps) => (
        <Switch>
          <Route
            path={routes.accounts._}
            render={(renderProps) => (
              <Accounts {...drawerProps} {...renderProps} />
            )}
          />
          <Route
            path={routes.boxes._}
            render={(renderProps) => (
              <Boxes {...drawerProps} {...renderProps} />
            )}
          />
        </Switch>
      )}
    </ScreenDrawer>
  );
}

Home.propTypes = {
};

Home.defaultProps = {
};

export default Home;
