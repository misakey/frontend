#### With history
```js
import React from 'react';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';
import ButtonGoBack from './index';

const ButtonGoBackExample = () => {
  const WrappedButtonGoBack = withRouter(ButtonGoBack);

  return (
    <React.Suspense fallback="Loading...">
      <Router>
        <WrappedButtonGoBack />
      </Router>
    </React.Suspense>
  );
};

  <ButtonGoBackExample />;
```
