import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import IdentitySchema from 'store/schemas/Identity';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonAccount from 'components/dumb/Button/Account';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import Box from '@material-ui/core/Box';

const CardIdentityThumbnail = ({ identity, ...props }) => {
  const { displayName, avatarUrl } = useMemo(
    () => identity || {},
    [identity],
  );

  return (
    <Box m={4}>
      <AvatarDetailed
        text={displayName}
        image={avatarUrl}
        title={displayName}
        {...props}
      />
      <ButtonAccount standing={BUTTON_STANDINGS.MAIN} />
    </Box>
  );
};

CardIdentityThumbnail.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes).isRequired,
};

export default CardIdentityThumbnail;
