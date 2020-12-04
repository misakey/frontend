AutocompleteWhitelist example

```js


import noop from '@misakey/helpers/noop';

import AutocompleteWhitelist from './index';

const AutocompleteWhitelistExample = () => (
  <AutocompleteWhitelist
    textFieldProps={{ name: 'whitelist', label: 'Add people or groups' }}
    onChange={noop}
  />
);

  <AutocompleteWhitelistExample />;
```