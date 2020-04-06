import React, { lazy } from 'react';
import { SnackbarProvider } from 'notistack';
import { IS_PLUGIN } from 'constants/plugin';

import ErrorBoundary from 'components/smart/ErrorBoundary';

import './App.scss';

const Plugin = lazy(() => import('components/App/Plugin'));
const Web = lazy(() => import('components/App/Web'));

const App = () => (
  <ErrorBoundary maxWidth="md" my={3}>
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      {(IS_PLUGIN) ? <Plugin /> : <Web />}
    </SnackbarProvider>
  </ErrorBoundary>
);

export default App;
