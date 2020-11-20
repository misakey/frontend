ScreenSplashWithTranslation example:

```js
import React from 'react';
import ScreenSplashWithTranslation from './index';

const ScreenSplashWithTranslationExample = () => (
  <React.Suspense fallback="Loading...">
    <ScreenSplashWithTranslation text="loading" />
  </React.Suspense>
);

  <ScreenSplashWithTranslationExample />;
```
