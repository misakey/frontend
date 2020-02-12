#### With pushPath
```js
import React from 'react';
import Navigation from '@misakey/ui/Navigation';
import { BrowserRouter as Router } from 'react-router-dom';


const NavigationExample = () => (
  <Router>
    <Navigation pushPath="/navigated" title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
  </Router>
);

  <NavigationExample />;
```

#### With goBackPath
```js
import React from 'react';
import Navigation from '@misakey/ui/Navigation';
import { BrowserRouter as Router } from 'react-router-dom';

const NavigationExample = () => (
  <Router>
    <Navigation goBackPath="/navigated" title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
  </Router>
);

  <NavigationExample />;
```

#### With history and pushPath
```js
import React from 'react';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';

import Navigation from '@misakey/ui/Navigation';

const WrappedNavigation = withRouter(Navigation);

const NavigationExample = () => (
  <Router>
    <WrappedNavigation pushPath="/navigated" title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
  </Router>
);

  <NavigationExample />;
```

#### With history and goBackPath
```js
import React from 'react';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';

import Navigation from '@misakey/ui/Navigation';

const WrappedNavigation = withRouter(Navigation);

const NavigationExample = () => (
  <Router>
    <WrappedNavigation goBackPath="/navigated" title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
  </Router>
);

  <NavigationExample />;
```


#### With history
```js
import React from 'react';
import { BrowserRouter as Router, withRouter } from 'react-router-dom';

import Navigation from '@misakey/ui/Navigation';

const WrappedNavigation = withRouter(Navigation);

const NavigationExample = () => (
  <Router>
    <WrappedNavigation title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
  </Router>
);

  <NavigationExample />;
```

#### With a location state
```js
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Navigation from '@misakey/ui/Navigation';
import { BrowserRouter as Router, withRouter, Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';

const PUSH_PATH = {
  pathname: '/navigated',
  state: { referrer: 'me' },
};

const LINK_PATH = {
  pathname: '/linked',
  state: { source: 'link' },
};

const LogNavigation = ({ log, history, location, ...props }) => {
  if (location.state && log === true) { console.log(location.state); }
  return (<Navigation location={location} {...props} />);
};

LogNavigation.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({ state: PropTypes.object }).isRequired,
  log: PropTypes.bool,
};

LogNavigation.defaultProps = {
  log: false,
};

const WrappedLogNavigation = withRouter(LogNavigation);

const NavigationExample = () => {
  const [log, setLog] = useState(false);

  const onClick = useCallback(
    () => setLog((isLog) => !isLog),
    [setLog],
  );

  return (
    <Router>
      <Button onClick={onClick} color="secondary" variant="contained">
        Log location state
      </Button>
      <Link to={LINK_PATH}>Go to /linked</Link>
      <WrappedLogNavigation log={log} pushPath={PUSH_PATH} title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
    </Router>
  );
};

  <NavigationExample />;
```

#### No go back
```js
import React from 'react';
import Navigation from '@misakey/ui/Navigation';

const NavigationExample = () => (
  <Navigation showGoBack={false} title="Navigation" toolbarProps={{ maxWidth: 'lg' }} />
);

  <NavigationExample />;
```