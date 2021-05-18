import React, { useMemo } from 'react';


import { LARGE } from '@misakey/ui/constants/sizes';
import { SIDES } from '@misakey/ui/constants/drawers';

import isNil from '@misakey/core/helpers/isNil';

import useGetOrgFromSearch from '@misakey/react/auth/hooks/useGetOrgFromSearch';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import IconButtonMenuAccount from 'components/smart/IconButton/Menu/Account';
import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import ScreenLockedAuth from '@misakey/ui/Screen/Locked/Auth';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';

// COMPONENTS
function VaultLocked(props) {
  const { organization } = useGetOrgFromSearch();
  const { name, logoUrl } = useSafeDestr(organization);

  const avatar = useMemo(
    () => {
      if (!isNil(name)) {
        return (
          <AvatarColorized
            size={LARGE}
            text={name}
            image={logoUrl}
            colorizedProp={BACKGROUND_COLOR}
          />
        );
      }
      return <AvatarMisakey size={LARGE} />;
    },
    [logoUrl, name],
  );

  return (
    <ScreenLockedAuth
      avatar={avatar}
      header={(
        <AppBarDrawer color="primary" side={SIDES.LEFT}>
          <IconButtonMenuAccount />
        </AppBarDrawer>
      )}
      {...props}
    />
  );
}

export default VaultLocked;
