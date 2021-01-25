#### No accessStatus

```js
import React from 'react';

import ListItemDomainWhitelisted from './index';

const ListItemDomainWhitelistedExample = () => (
  <ListItemDomainWhitelisted
    displayName="All users from domain"
    identifier="@misakey.com"
  />
);

  <ListItemDomainWhitelistedExample />;
```

#### Invitation sent

```js


import React from 'react';
import {
  ACCESS_STATUS_INVITED,
} from '@misakey/ui/constants/accessStatus';
import ListItemDomainWhitelisted from './index';

const ListItemDomainWhitelistedExample = () => (
  <ListItemDomainWhitelisted
    displayName="All users from domain"
    identifier="@misakey.com"
    accessStatus={ACCESS_STATUS_INVITED}
  />
);

  <ListItemDomainWhitelistedExample />;
```

#### Link required

```js

import React from 'react';

import {
  ACCESS_STATUS_NEEDS_LINK,
} from '@misakey/ui/constants/accessStatus';
import ListItemDomainWhitelisted from './index';

const ListItemDomainWhitelistedExample = () => (
  <ListItemDomainWhitelisted
    displayName="All users from domain"
    identifier="@misakey.com"
    accessStatus={ACCESS_STATUS_NEEDS_LINK}
  />
);

  <ListItemDomainWhitelistedExample />;
```

#### Member

```js

import React from 'react';

import {
  ACCESS_STATUS_MEMBER,
} from '@misakey/ui/constants/accessStatus';
import ListItemDomainWhitelisted from './index';

const ListItemDomainWhitelistedExample = () => (
  <ListItemDomainWhitelisted
    displayName="All users from domain"
    identifier="@misakey.com"
    accessStatus={ACCESS_STATUS_MEMBER}
  />
);

  <ListItemDomainWhitelistedExample />;
```

