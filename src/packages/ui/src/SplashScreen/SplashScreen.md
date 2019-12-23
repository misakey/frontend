```js
import React from 'react';
import BoxSection from '@misakey/ui/Box/Section';
import SplashScreen from '@misakey/ui/SplashScreen';
import Typography from '@material-ui/core/Typography';

const SplashScreenExample = () => (
  <React.Suspense fallback="Loading...">
    <BoxSection style={{ position: 'relative', height: 300 }}>
      <Typography variant="h5" align="center">SplashScreen</Typography>
      <Typography variant="subtitle1" align="center">with backdrop</Typography>
      <SplashScreen variant="backdrop" />
    </BoxSection>
  </React.Suspense>
);

  <SplashScreenExample />;
```
