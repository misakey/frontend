import React, { useMemo } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';

import ScreenDrawer from 'components/smart/Screen/Drawer';
import DocumentsVault from 'components/screens/app/Documents/Read/Vault';
import DocumentNone from 'components/screens/app/Documents/None';
import DocumentList from 'components/screens/app/Documents/List';

import isNil from '@misakey/helpers/isNil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';
import VaultLockedScreen from 'components/screens/app/VaultLocked';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerContent: {
    position: 'relative',
  },
}));

// COMPONENTS
function Documents({ match, ...props }) {
  const classes = useStyles();
  const matchWorkspaceSelected = useRouteMatch(routes.documents._);
  const { params: { id } } = useMemo(
    () => matchWorkspaceSelected || { params: {} },
    [matchWorkspaceSelected],
  );
  const isNothingSelected = useMemo(() => isNil(id), [id]);

  const initialIsDrawerOpen = useMemo(
    () => isNothingSelected,
    [isNothingSelected],
  );

  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  if (shouldDisplayLockedScreen) {
    return (
      <ScreenDrawer
        drawerChildren={(drawerProps) => <VaultLockedScreen {...drawerProps} />}
        isFullWidth
      />
    );
  }

  return (
    <ScreenDrawer
      classes={{ content: classes.drawerContent }}
      drawerChildren={(drawerProps) => <DocumentList {...drawerProps} />}
      initialIsDrawerOpen={initialIsDrawerOpen}
      {...props}
    >
      {(drawerProps) => (
        <Switch>
          <Route
            path={routes.documents.vault}
            render={(renderProps) => (
              <DocumentsVault {...drawerProps} {...renderProps} />
            )}
          />
          <Route
            exact
            path={match.path}
            render={(renderProps) => (
              <DocumentNone {...drawerProps} {...renderProps} />
            )}
          />
        </Switch>
      )}
    </ScreenDrawer>
  );
}


Documents.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Documents;
