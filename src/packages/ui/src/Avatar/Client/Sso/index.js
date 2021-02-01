import React from 'react';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react-auth/store/reducers/sso';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import AvatarClient from '@misakey/ui/Avatar/Client';

// COMPONENTS
const AvatarClientSso = ({ client, ...rest }) => {
  const { name, logoUri } = useSafeDestr(client);

  return (
    <AvatarClient
      src={logoUri}
      name={name}
      large
      {...rest}
    />
  );
};

AvatarClientSso.propTypes = {
  client: SSO_PROP_TYPES.client.isRequired,
};

export default AvatarClientSso;
