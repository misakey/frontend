#### Image

```js

import React from 'react';

import lemur from '@misakey/ui/lemur';

import AvatarBox from './index';

const AvatarBoxExample = () => (
  <AvatarBox
    title="Test"
    src={lemur}
  />
);

  <AvatarBoxExample />;
```

#### Title

```js
import React from 'react';


import AvatarBox from './index';

const AvatarBoxExample = () => (
  <AvatarBox
    title="Test"
  />
);

  <AvatarBoxExample />;
```

#### Lost key

```js
import React from 'react';


import AvatarBox from './index';

const AvatarBoxExample = () => (
  <AvatarBox
    title="Test"
    lostKey
  />
);

  <AvatarBoxExample />;
```

#### Large

##### Image

```js
import React from 'react';


import lemur from '@misakey/ui/lemur';

import AvatarBox from './index';

const AvatarBoxExample = () => (
  <AvatarBox
    title="Test"
    src={lemur}
    size="large"
  />
);

  <AvatarBoxExample />;
```

##### Title

```js
import React from 'react';


import AvatarBox from './index';

const AvatarBoxExample = () => (
  <AvatarBox
    title="Test"
    size="large"
  />
);

  <AvatarBoxExample />;
```

##### Lost key

```js
import React from 'react';


import AvatarBox from './index';

const AvatarBoxExample = () => (
  <AvatarBox
    title="Test"
    lostKey
    size="large"
  />
);

  <AvatarBoxExample />;
```