#### Image

```js
import React from 'react';

import lemur from '@misakey/ui/lemur';

import ListItemUser from './index';

const ListItemUserExample = () => (
  <ListItemUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
    avatarUrl={lemur}
  />
);

  <ListItemUserExample />;
```


#### Letter

```js
import React from 'react';

import ListItemUser from './index';

const ListItemUserExample = () => (
  <ListItemUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
  />
);

  <ListItemUserExample />;
```

#### Empty

```js
import React from 'react';

import ListItemUser from './index';

const ListItemUserExample = () => (
  <ListItemUser />
);

  <ListItemUserExample />;
```

#### Children

```js
import React from 'react';


import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemUser from './index';

const ListItemUserExample = () => (
  <ListItemUser
    ContainerComponent="div"
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
  >
    <ListItemSecondaryAction><IconButton><MoreVertIcon /></IconButton></ListItemSecondaryAction>
  </ListItemUser>
);

  <ListItemUserExample />;
```