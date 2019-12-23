#### With className
```js
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Portal from './index';

// CONSTANTS
const PORTAL_ID = 'PORTAL_ID';

// HOOKS
const useStyles = makeStyles(() => ({
  elem: {
    color: 'red',
  },
}));

const PortalExample = () => {
  const classes = useStyles();
  return (
    <React.Suspense fallback="Loading...">
      <div>
        Before
        <div id={PORTAL_ID} />
        After
        <Portal elementId={PORTAL_ID} className={classes.elem}>
          Middle
        </Portal>
      </div>
    </React.Suspense>
  );
};

  <PortalExample />;
```