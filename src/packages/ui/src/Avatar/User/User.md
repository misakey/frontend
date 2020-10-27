#### Image

```js
import React from 'react';

import lemur from '@misakey/ui/lemur';

import AvatarUser from './index';

const AvatarUserExample = () => (
  <AvatarUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
    avatarUrl={lemur}
  />
);

  <AvatarUserExample />;
```


#### Letter

```js
import React from 'react';

import AvatarUser from './index';

const AvatarUserExample = () => (
  <AvatarUser
    displayName="Toto Test"
    identifier="toto.test@misakey.com"
  />
);

  <AvatarUserExample />;
```

#### Empty

```js
import React from 'react';

import AvatarUser from './index';

const AvatarUserExample = () => (
  <AvatarUser />
);

  <AvatarUserExample />;
```