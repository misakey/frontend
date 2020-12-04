ButtonCopy example:

```js
import { useState, useCallback } from 'react';
import { SnackbarProvider } from 'notistack';
import TextField from '@material-ui/core/TextField';

import ButtonCopy from './index';

const ButtonCopyExample = () => {
  const [value, setValue] = useState('');

  const onChange = useCallback((event) => setValue(event.target.value), [setValue]);

  return (
    <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <TextField
        label="Text"
        placeholder="Type something to copy"
        value={value}
        onChange={onChange}
      />
      <ButtonCopy
        value={value}
      />
    </SnackbarProvider>
  );
};

  <ButtonCopyExample />;
```
