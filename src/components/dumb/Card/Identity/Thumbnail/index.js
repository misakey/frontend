import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import IdentitySchema from 'store/schemas/Identity';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import isNil from '@misakey/helpers/isNil';

import ButtonAccount from 'components/dumb/Button/Account';
import LinkAccountMisakey from 'components/smart/Link/Account/Misakey';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import AvatarDetailedSkeleton from '@misakey/ui/Avatar/Detailed/Skeleton';
import Box from '@material-ui/core/Box';

const CardIdentityThumbnail = ({ identity, ...props }) => {
  const hasIdentity = useMemo(
    () => !isNil(identity),
    [identity],
  );

  const { displayName, avatarUrl, identifier: { value: identifierValue } = {} } = useMemo(
    () => identity || {},
    [identity],
  );

  return (
    <Box mx={4} mb={4}>
      {hasIdentity ? (
        <AvatarDetailed
          text={displayName}
          image={avatarUrl}
          title={displayName}
          subtitle={identifierValue}
          {...props}
        />
      ) : (
        <AvatarDetailedSkeleton
          title={displayName}
          {...props}
        />
      )}
      <ButtonAccount
        component={LinkAccountMisakey}
        standing={BUTTON_STANDINGS.MAIN}
      />
    </Box>
  );
};

CardIdentityThumbnail.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
};

CardIdentityThumbnail.defaultProps = {
  identity: null,
};

export default CardIdentityThumbnail;
