AutocompleteWhitelist example

```js
import React from 'react';


import noop from '@misakey/core/helpers/noop';

import AutocompleteWhitelist from './index';

const AutocompleteWhitelistExample = () => (
  <AutocompleteWhitelist
    textFieldProps={{ name: 'whitelist', label: 'Add people or groups' }}
    onChange={noop}
  />
);

  <AutocompleteWhitelistExample />;
```
