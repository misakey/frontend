import React, { forwardRef } from 'react';


import LinkAccount from '@misakey/react-auth/components/Link/Account';
import useIdentity from '@misakey/react-auth/hooks/useIdentity';

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
