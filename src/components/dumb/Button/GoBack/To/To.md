#### With history
```js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ButtonGoBackTo from './index';

const ButtonGoBackToExample = () => (
  <React.Suspense fallback="Loading...">
    <Router>
      <ButtonGoBackTo />
    </Router>
  </React.Suspense>
);

  <ButtonGoBackToExample />;
```
