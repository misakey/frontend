import React, { useMemo, forwardRef } from 'react';

import { useTranslation } from 'react-i18next';

import { useStyles } from '@misakey/ui/ListItem/Organization';
import {
  SMALL,
} from '@misakey/ui/constants/sizes';
import ListItemCurrentUser from 'components/smart/ListItem/CurrentUser';

// CONSTANTS
const AVATAR_PROPS = {
  size: SMALL,
};

// COMPONENTS
const ListItemOrganizationSelf = forwardRef((props, ref) => {
  const { t } = useTranslation('organizations');
  const classes = useStyles();


  const listItemTextProps = useMemo(
    () => ({
      primary: t('organizations:self'),
      primaryTypographyProps: {
        color: 'textPrimary',
        noWrap: true,
        variant: 'body2',
      },
      secondary: null,
    }),
    [t],
  );

  return (
    <ListItemCurrentUser
      ref={ref}
      disableGutters
      listItemTextProps={listItemTextProps}
      avatarProps={AVATAR_PROPS}
      classes={{
        root: classes.listItemRoot,
        listItemAvatar: classes.listItemAvatarRoot,
      }}
      {...props}
    />
  );
});

export default ListItemOrganizationSelf;
