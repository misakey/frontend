import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import UserSchema from 'store/schemas/User';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonAccount from 'components/dumb/Button/Account';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import Box from '@material-ui/core/Box';

const CardProfileThumbnail = ({ profile, ...props }) => {
  const { displayName, avatarUrl } = useMemo(
    () => profile || {},
    [profile],
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

CardProfileThumbnail.propTypes = {
  profile: PropTypes.shape(UserSchema.propTypes).isRequired,
};

export default CardProfileThumbnail;
