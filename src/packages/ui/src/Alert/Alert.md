Alert example:
```js
import React, { useState } from 'react';


import Button from '@material-ui/core/Button';


import Alert from './index';

const AlertExample = () => {
  const [open, setOpen] = useState(false);
  const handleButtonClick = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button onClick={handleButtonClick} color="primary" variant="contained">
        Show Alert
      </Button>
      <Alert
        open={open}
        onClose={handleClose}
        onOk={handleClose}
        title="Hello World !"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed fermentum eros a lobortis faucibus. Duis efficitur, libero ac facilisis placerat, nulla nunc finibus ante, et commodo neque lacus vel velit."
      />
    </>
  );
};

  <AlertExample />;
```
