#### Delay in seconds, same text

```js
import React, { useCallback } from 'react';
import { SnackbarProvider, withSnackbar } from 'notistack';

import ButtonDisabledDelay from './index';

// CONSTANTS
const TEXT = 'Click';

// CHANGE VALUE TO TEST DIFFERENT DELAYS
const SECONDS_DELAY = 10;
const UNIT = 'seconds';

// COMPONENTS
const ButtonDisabledDelayWithSnackbar = withSnackbar(({ enqueueSnackbar }) => {
  const onClick = useCallback(
    () => {
      enqueueSnackbar(TEXT, { variant: 'success' });
    },
    [enqueueSnackbar],
  );
  return (
    <ButtonDisabledDelay
      text={TEXT}
      onClick={onClick}
      delay={SECONDS_DELAY}
      unit={UNIT}
    />
  );
});

const ButtonDisabledDelayExample = () => (
  <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <ButtonDisabledDelayWithSnackbar />
  </SnackbarProvider>
);

  <ButtonDisabledDelayExample />;
```

#### Delay in seconds, different text during delay
```js
import React, { useCallback } from 'react';
import { SnackbarProvider, withSnackbar } from 'notistack';

import ButtonDisabledDelay from './index';

// CONSTANTS
const TEXT = 'Click';
const DELAYED_TEXT = 'Cannot click';

// CHANGE VALUE TO TEST DIFFERENT DELAYS
const SECONDS_DELAY = 10;
const UNIT = 'seconds';

// COMPONENTS
const ButtonDisabledDelayWithSnackbar = withSnackbar(({ enqueueSnackbar }) => {
  const onClick = useCallback(
    () => {
      enqueueSnackbar(TEXT, { variant: 'success' });
    },
    [enqueueSnackbar],
  );
  return (
    <ButtonDisabledDelay
      text={TEXT}
      delayedText={DELAYED_TEXT}
      onClick={onClick}
      delay={SECONDS_DELAY}
      unit={UNIT}
    />
  );
});

const ButtonDisabledDelayExample = () => (
  <SnackbarProvider maxSnack={6} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <ButtonDisabledDelayWithSnackbar />
  </SnackbarProvider>
);

  <ButtonDisabledDelayExample />;
```