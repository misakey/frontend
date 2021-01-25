#### Default

```js


import React from 'react';
import ListItemDomain from './index';

const ListItemDomainExample = () => (
  <ListItemDomain
    displayName="All users from domain"
    identifier="@misakey.com"
  />
);

  <ListItemDomainExample />;
```

#### Children

```js



import React from 'react';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemDomain from './index';

const ListItemDomainExample = () => (
  <ListItemDomain
    ContainerComponent="div"
    displayName="All users from domain"
    identifier="@misakey.com"
  >
    <ListItemSecondaryAction><IconButton><MoreVertIcon /></IconButton></ListItemSecondaryAction>
  </ListItemDomain>
);

  <ListItemDomainExample />;
```