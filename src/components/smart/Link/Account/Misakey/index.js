import React, { forwardRef } from 'react';


import useAccountId from 'hooks/useAccountId';

import LinkAccount from 'components/smart/Link/Account';
import useIdentity from 'hooks/useIdentity';

// COMPONENTS
const LinkAccountMisakey = forwardRef((props, ref) => {
  const { identity } = useIdentity();
  const accountId = useAccountId(identity);
  return (
    <LinkAccount
      ref={ref}
      {...props}
      id={accountId}
    />
  );
});

export default LinkAccountMisakey;
