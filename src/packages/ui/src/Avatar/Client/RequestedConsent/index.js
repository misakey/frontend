import React from 'react';
import PropTypes from 'prop-types';

import { LARGE } from '@misakey/ui/constants/sizes';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import OrganizationsSchema from '@misakey/react/auth/store/schemas/Organizations';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import AvatarClient from '@misakey/ui/Avatar/Client/Grow';
import Box from '@material-ui/core/Box';

// COMPONENTS
const AvatarClientRequestedConsent = ({ client, organization, ...rest }) => {
  const { name, logoUri } = useSafeDestr(client);

  const { name: orgName, logoUrl: orgLogoUrl } = useSafeDestr(organization);

  return (
    <Box
      display="flex"
    >
      <Box mr={2}>
        <AvatarClient
          src={logoUri}
          name={name}
          size={LARGE}
          {...rest}
        />
      </Box>
      <AvatarClient
        src={orgLogoUrl}
        name={orgName}
        size={LARGE}
        {...rest}
      />
    </Box>
  );
};

AvatarClientRequestedConsent.propTypes = {
  client: SSO_PROP_TYPES.client.isRequired, // flow initiator = the one who wants data
  organization: PropTypes.shape(OrganizationsSchema.propTypes).isRequired, // requested consent org
};

export default AvatarClientRequestedConsent;
