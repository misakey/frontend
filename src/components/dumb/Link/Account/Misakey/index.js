import React, { forwardRef } from 'react';

import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import LinkAccount from 'components/dumb/Link/Account';


// COMPONENTS
const LinkAccountMisakey = forwardRef((props, ref) => (
  <LinkAccount
    ref={ref}
    id={MISAKEY_ACCOUNT_ID}
    {...props}
  />
));

export default LinkAccountMisakey;
