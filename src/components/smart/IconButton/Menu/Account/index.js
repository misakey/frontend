import React, { forwardRef } from 'react';

import { useMenuAccountContext } from 'components/smart/Menu/Account/Context';

import IconButtonAccount from 'components/smart/IconButton/Account';

// COMPONENTS
const IconButtonMenuAccount = forwardRef((props, ref) => {
  const { onClick } = useMenuAccountContext();

  return (
    <IconButtonAccount ref={ref} onClick={onClick} {...props} />
  );
});

export default IconButtonMenuAccount;
