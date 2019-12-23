DialogAccountDelete example:

```js
import React, { useState, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import DialogAccountDelete from './index';

const profile = { email: 'sidialaflemmedetapperunemailtroplong@pourvaliderlecomposant.gnagnagna' };

const DialogAccountDeleteExample = () => {
  const [open, setOpen] = useState(false);

  const onClick = useCallback(
    () => { setOpen((isOpen) => !isOpen); },
    [setOpen],
  );

  const onClose = useCallback(
    () => {
      console.log('close');
      setOpen(false);
    },
    [setOpen],
  );

  const onSuccess = useCallback(
    () => {
      console.log('success');
      setOpen(false);
    },
    [setOpen],
  );

  return (
    <React.Suspense fallback="Loading...">
      <DialogAccountDelete
        onClose={onClose}
        onSuccess={onSuccess}
        open={open}
        profile={profile}
      />
      <Button onClick={onClick} color="primary" variant="contained">
        Show dialog
      </Button>
    </React.Suspense>
  );
};

  <DialogAccountDeleteExample />;
```
