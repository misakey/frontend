#### With history
```js
import React, { Suspense } from 'react';


import { BrowserRouter as Router } from 'react-router-dom';
import ButtonGoBackTo from './index';

const ButtonGoBackToExample = () => (
  <Suspense fallback="Loading...">
    <Router>
      <ButtonGoBackTo />
    </Router>
  </Suspense>
);

  <ButtonGoBackToExample />;
```
