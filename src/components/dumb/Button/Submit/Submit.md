ButtonSubmit example:

```js
import React, { useState, useCallback } from 'react';
import EmailIcon from '@material-ui/icons/Email';
import ButtonSubmit from './index';

const useHandleSubmit = setSubmitting => useCallback(() => {
  setSubmitting(true);
  setTimeout(() => {
    setSubmitting(false);
  }, 3000);
},
[setSubmitting]);

const ButtonSubmitExample = () => {
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = useHandleSubmit(setSubmitting);

  return (
    <React.Suspense fallback="Loading...">
      <ButtonSubmit
        Icon={EmailIcon}
        isSubmitting={isSubmitting}
        onClick={handleSubmit}
      />
    </React.Suspense>
  );
};

  <ButtonSubmitExample />;
```
