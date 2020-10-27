import React, { forwardRef } from 'react';

import LinkAccount from 'components/smart/Link/Account';
import useIdentity from 'hooks/useIdentity';

// COMPONENTS
const LinkAccountMisakey = forwardRef((props, ref) => {
  const { identityId } = useIdentity();

  return (
    <LinkAccount
      ref={ref}
      {...props}
      id={identityId}
    />
  );
});

export default LinkAccountMisakey;
