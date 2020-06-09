#### Not connected

Should return `null`
```js
import React, { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import ButtonConnectToken from './index';

const AccountLink = forwardRef((props, ref) => <Link ref={ref} to="/account" {...props} />);
const onSignOut = console.log;
const profile = {
  displayName: 'test',
  email: 'test@misakey.com',
};
const ButtonConnectTokenExample = () => (
  <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <Router>
      <ButtonConnectToken
        AccountLink={AccountLink}
        onSignOut={onSignOut}
        profile={profile}
      />
    </Router>
  </SnackbarProvider>
);

  <ButtonConnectTokenExample />;
```

#### Connected
```js
import React, { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ButtonConnectToken from './index';
import { token, id } from '../auth.json';


const useStyles = makeStyles((theme) => ({
  iconButtonRoot: {
    marginRight: theme.spacing(-2),
  },
}));

const AccountLink = forwardRef((props, ref) => <Link ref={ref} to="/account" {...props} />);
const enqueueSnackBar = console.log;
const onSignOut = console.log;
const profile = {
  displayName: 'test',
  email: 'test@misakey.com',
};
const ButtonConnectTokenExample = () => {
  const classes = useStyles();
  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <ButtonConnectToken
          AccountLink={AccountLink}
          enqueueSnackBar={enqueueSnackBar}
          onSignOut={onSignOut}
          profile={profile}
          token={token}
          id={id}
          classes={{ root: classes.iconButtonRoot }}
        />
      </Router>
    </SnackbarProvider>
  );
};

  <ButtonConnectTokenExample />;
```
