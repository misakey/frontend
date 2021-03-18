import React, { lazy, Suspense } from 'react';

import retry from '@misakey/helpers/retry';

import OfflineAlert from 'components/smart/Context/Offline/Alert';
import Screen from '@misakey/ui/Screen';

import './App.scss';

// LAZY
const BoxesApp = lazy(() => retry(() => import('components/screens/app')));

const App = () => (
  <Suspense fallback={<Screen isLoading hideFooter />}>
    <OfflineAlert position="absolute" top={0} zIndex="snackbar" width="100%" />
    <BoxesApp />
  </Suspense>
);

export default App;
