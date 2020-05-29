#### Not connected
```js
import React from 'react';
import ButtonConnectNoToken from './index';

const ButtonConnectNoTokenExample = () => (
  <ButtonConnectNoToken
    application="app"
  >
    Sign In
  </ButtonConnectNoToken>
);


  <ButtonConnectNoTokenExample />;
```

#### Not connected with icon as children
```js
import React from 'react';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ButtonConnectNoToken from './index';

const ButtonConnectNoTokenExample = () => (
  <ButtonConnectNoToken
    application="app"
  >
    <AccountCircleIcon />
  </ButtonConnectNoToken>
);


  <ButtonConnectNoTokenExample />;
```

#### Not connected with icon as props
```js
import React from 'react';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ButtonConnectNoToken from './index';

const useStyles = makeStyles((theme) => ({
  iconButtonRoot: {
    marginRight: theme.spacing(-2),
  },
}));

const ButtonConnectNoTokenExample = () => {
  const classes = useStyles();
  return (
    <ButtonConnectNoToken
      application="app"
      classes={{ root: classes.iconButtonRoot }}
      Icon={<AccountCircleIcon />}
    />
  );
};

  <ButtonConnectNoTokenExample />;
```



#### Connected

Should return `null`
```js
import React from 'react';
import ButtonConnectNoToken from './index';
import { token } from '../auth.json';

const ButtonConnectNoTokenExample = () => (
  <ButtonConnectNoToken
    application="app"
    token={token}
  >
    Sign In
  </ButtonConnectNoToken>
);


  <ButtonConnectNoTokenExample />;
```