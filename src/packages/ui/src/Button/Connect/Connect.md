#### Not connected
```js
import React, { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import ButtonConnect from './index';

const AccountLink = forwardRef((props, ref) => <Link ref={ref} to="/account" {...props} />);
const enqueueSnackBar = console.log;
const onSignIn = console.log;
const onSignOut = console.log;
const identity = {
  displayName: 'test',
  email: 'test@misakey.com',
};

const useStyles = makeStyles((theme) => ({
  iconButtonRoot: {
    marginRight: theme.spacing(-2),
  },
}));

const ButtonConnectExample = () => {
  const classes = useStyles();
  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <ButtonConnect
          application="app"
          AccountLink={AccountLink}
          enqueueSnackBar={enqueueSnackBar}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          classes={{ noToken: { iconButton: { root: classes.iconButtonRoot } } }}
          identity={identity}
        />
      </Router>
    </SnackbarProvider>
  );
};
  <ButtonConnectExample />;
```

#### Not connected with icon
```js
import React, { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ButtonConnect from './index';

const AccountLink = forwardRef((props, ref) => <Link ref={ref} to="/account" {...props} />);
const enqueueSnackBar = console.log;
const onSignIn = console.log;
const onSignOut = console.log;
const identity = {
  displayName: 'test',
  email: 'test@misakey.com',
};

const useStyles = makeStyles((theme) => ({
  iconButtonRoot: {
    marginRight: theme.spacing(-2),
  },
}));

const ButtonConnectExample = () => {
  const classes = useStyles();

  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Router>
        <ButtonConnect
          application="app"
          AccountLink={AccountLink}
          enqueueSnackBar={enqueueSnackBar}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
          identity={identity}
          classes={{ noToken: { iconButton: { root: classes.iconButtonRoot } } }}
          noTokenIcon={<AccountCircleIcon />}
        />
      </Router>
    </SnackbarProvider>
  );
};
  <ButtonConnectExample />;
```



#### Connected
```js
import React, { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import { Link, BrowserRouter as Router } from 'react-router-dom';
import ButtonConnect from './index';
import { token, id } from './auth.json';

const AccountLink = forwardRef((props, ref) => <Link ref={ref} to="/account" {...props} />);
const enqueueSnackBar = console.log;
const onSignIn = console.log;
const onSignOut = console.log;
const identity = {
  displayName: 'test',
  email: 'test@misakey.com',
};
const ButtonConnectExample = () => (
  <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <Router>
      <ButtonConnect
        application="app"
        AccountLink={AccountLink}
        enqueueSnackBar={enqueueSnackBar}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        identity={identity}
        token={token}
        id={id}
      />
    </Router>
  </SnackbarProvider>
);

  <ButtonConnectExample />;
```
