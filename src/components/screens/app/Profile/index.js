import React, { useMemo } from 'react';
import { Switch, Route, Redirect, useParams, generatePath, useRouteMatch } from 'react-router-dom';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import useIdentity from 'hooks/useIdentity';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Identities from 'components/screens/app/Identity';
import IdentityPublicReadOnly from 'components/screens/app/Identity/Public/ReadOnly';
import RouteAcr from '@misakey/auth/components/Route/Acr';
import ScreenDrawerContextProvider from 'components/smart/Screen/Drawer';
import DrawerAccountContent from 'components/smart/Drawer/Account/Content';
import DrawerAccountOnboard from 'components/smart/Drawer/Account/Onboard';

import ProfileHome from 'components/screens/app/Profile/Home';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerContent: {
    position: 'relative',
    overflow: 'auto',
  },
}));

// COMPONENTS
function Profile(props) {
  const classes = useStyles();

  const { path } = useRouteMatch();
  const identityMetadata = useIdentity();
  const { identityId } = useSafeDestr(identityMetadata);

  const hasIdentityId = useMemo(
    () => !isNil(identityId),
    [identityId],
  );

  const { id } = useParams();

  const isMe = useMemo(
    () => identityId === id,
    [id, identityId],
  );

  const redirectTo = useMemo(
    () => (hasIdentityId ? generatePath(path, { id: identityId }) : routes._),
    [hasIdentityId, identityId, path],
  );

  if (isMe) {
    return (
      <ScreenDrawerContextProvider
        classes={{ content: classes.drawerContent }}
        drawerChildren={<DrawerAccountContent backTo={routes.boxes._} />}
        {...props}
      >
        {(drawerProps) => (
          <Switch>
            <Route
              exact
              path={path}
              render={(routerProps) => (
                <ProfileHome
                  identityMetadata={identityMetadata}
                  {...props}
                  {...routerProps}
                  {...drawerProps}
                />
              )}
            />
            <RouteAcr
              acr={1}
              path={routes.identities._}
              component={Identities}
            />
          </Switch>
        )}
      </ScreenDrawerContextProvider>
    );
  }

  return (
    <ScreenDrawerContextProvider
      initialIsDrawerOpen={false}
      classes={{ content: classes.drawerContent }}
      drawerChildren={(hasIdentityId
        ? <DrawerAccountContent backTo={routes.boxes._} />
        : <DrawerAccountOnboard />
      )}
      {...props}
    >
      <Switch>
        <Route
            exact
            path={routes.identities.public}
            render={(routerProps) => <IdentityPublicReadOnly {...routerProps} />}
        />
        <Redirect from={path} to={redirectTo} />
      </Switch>
    </ScreenDrawerContextProvider>

  );
}

export default Profile;
