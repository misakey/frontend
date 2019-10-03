import React from 'react';
import ButtonConnectWrapper from '@misakey/auth/components/Button/Connect/Wrapper';
import AccountLink from 'components/dumb/Link/Account';

const ButtonConnect = props => (
  <ButtonConnectWrapper
    AccountLink={AccountLink}
    {...props}
  />
);

export default ButtonConnect;
