ScreenSplashWithTranslation example:

```js
import React, { Suspense } from 'react';

import ScreenSplashWithTranslation from './index';

const ScreenSplashWithTranslationExample = () => (
  <Suspense fallback="Loading...">
    <ScreenSplashWithTranslation text="loading" />
  </Suspense>
);

  <ScreenSplashWithTranslationExample />;
```
