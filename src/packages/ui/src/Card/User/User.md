#### Action

```js
import React from 'react';

import lemur from '@misakey/ui/lemur';

import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import CardUser from './index';

const CardUserExample = () => (
  <CardUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
    avatarUrl={lemur}
    action={(
      <IconButton>
        <CloseIcon />
      </IconButton>
    )}
  />
);

  <CardUserExample />;
```

#### Expired

```js
import React from 'react';

import moment from 'moment';

import lemur from '@misakey/ui/lemur';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

import CardUser from './index';

const CardUserExample = () => {
  const oneDayAgo = moment().subtract(1, 'day').toString();

  return (
    <CardUser
      displayName="Toto Test"
      identifier="toto.test@misakey.com"
      avatarUrl={lemur}
      expired
      expiresAt={oneDayAgo}
      action={(
        <IconButton>
          <CloseIcon />
        </IconButton>
    )}
    />
  );
};

  <CardUserExample />;
```

#### Image

```js
import React from 'react';

import lemur from '@misakey/ui/lemur';

import CardUser from './index';

const CardUserExample = () => (
  <CardUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
    avatarUrl={lemur}
  />
);

  <CardUserExample />;
```

#### Letter

```js
import React from 'react';

import CardUser from './index';

const CardUserExample = () => (
  <CardUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
  />
);

  <CardUserExample />;
```

#### Empty

```js
import React from 'react';

import CardUser from './index';

const CardUserExample = () => (
  <CardUser />
);

  <CardUserExample />;
```