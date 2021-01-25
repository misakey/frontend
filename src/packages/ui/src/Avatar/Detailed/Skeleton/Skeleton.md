AvatatDetailedSkeleton example:

```js
import React from 'react';

import AvatarDetailedSkeleton from './index';

const mock = {
  title: 'Lemur',
  subtitle: 'Lemurs are mammals of the order Primates',
};

const AvatarDetailedSkeletonExample = () => (
  <AvatarDetailedSkeleton
    {...mock}
  />
);

  <AvatarDetailedSkeletonExample />;
```