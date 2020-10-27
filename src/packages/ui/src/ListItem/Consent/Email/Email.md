ListItemConsent example:

```js
import React from 'react';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import List from '@material-ui/core/List';

import ListItemConsent from './index';

const ListItemConsentExample = () => (
  <List>
    <ListItemConsent>
      <Button
        standing={BUTTON_STANDINGS.MAIN}
        text="Confirm"
      />
    </ListItemConsent>
  </List>
);

  <ListItemConsentExample />;
```
