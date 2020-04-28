import React, { lazy, useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { IS_PLUGIN } from 'constants/plugin';
import { WORKSPACE } from 'constants/workspaces';
import { updateProfile } from '@misakey/auth/store/actions/auth';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import ErrorBoundary from 'components/smart/ErrorBoundary';
import ScreenSplash from 'components/dumb/Screen/Splash';

import './App.scss';

const Plugin = lazy(() => import('components/App/Plugin'));
const Web = lazy(() => import('components/App/Web'));

const App = ({ isAuthenticated, dispatchUpdateProfileWorkspace }) => {
  const workspace = useLocationWorkspace(true);
  // update profile workspace anytime workspace and isAuthenticated change
  useEffect(
    () => {
      if (!isNil(workspace) && workspace !== WORKSPACE.ACCOUNT && isAuthenticated) {
        dispatchUpdateProfileWorkspace(workspace);
      }
    },
    [workspace, dispatchUpdateProfileWorkspace, isAuthenticated],
  );

  return (
    <ErrorBoundary maxWidth="md" my={3}>
      <Suspense fallback={<ScreenSplash />}>
        {(IS_PLUGIN) ? <Plugin /> : <Web />}
      </Suspense>
    </ErrorBoundary>
  );
};

App.propTypes = {
  // CONNECT
  isAuthenticated: PropTypes.bool,
  dispatchUpdateProfileWorkspace: PropTypes.func.isRequired,
};

App.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateProfileWorkspace: (workspace) => dispatch(updateProfile({ workspace })),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
