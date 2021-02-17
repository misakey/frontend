import React, { useMemo, forwardRef } from 'react';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import {
  SMALL,
  SMALL_AVATAR_SIZE,
  SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/Avatar';
import ListItemCurrentUser from 'components/smart/ListItem/CurrentUser';

// CONSTANTS
const AVATAR_PROPS = {
  size: SMALL,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemAvatarRoot: {
    minWidth: SMALL_AVATAR_SIZE + 16,
    [theme.breakpoints.down('sm')]: {
      minWidth: SMALL_AVATAR_SM_SIZE + 16,
    },
  },
}));

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
        variant: 'caption',
      },
      secondary: null,
    }),
    [t],
  );

  return (
    <ListItemCurrentUser
      ref={ref}
      listItemTextProps={listItemTextProps}
      avatarProps={AVATAR_PROPS}
      classes={{ listItemAvatar: classes.listItemAvatarRoot }}
      {...props}
    />
  );
});

export default ListItemOrganizationSelf;
