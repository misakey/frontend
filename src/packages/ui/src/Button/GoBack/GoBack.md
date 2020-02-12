#### With history
```js
import React from 'react';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';
import ButtonGoBack from './index';

const ButtonGoBackExample = () => {
  const WrappedButtonGoBack = withRouter(ButtonGoBack);

  return (
    <Router>
      <WrappedButtonGoBack />
    </Router>
  );
};

  <ButtonGoBackExample />;
```
