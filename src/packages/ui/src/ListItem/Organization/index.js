import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import {
  SMALL_AVATAR_SIZE,
  SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';

// HOOKS
export const useStyles = makeStyles((theme) => ({
  listItemRoot: {
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    '&.Mui-selected': {
      paddingLeft: theme.spacing(0.5) - 3,
    },
  },
  listItemAvatarRoot: {
    minWidth: SMALL_AVATAR_SIZE + theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      minWidth: SMALL_AVATAR_SM_SIZE + theme.spacing(0.5),
    },
  },
}));

// COMPONENTS
const ListItemOrganization = forwardRef(({
  name, secondary, children, listItemTextProps, ...rest
}, ref) => {
  const classes = useStyles();
  return (
    <ListItem classes={{ root: classes.listItemRoot }} ref={ref} {...rest}>
      <ListItemAvatar classes={{ root: classes.listItemAvatarRoot }}>
        <AvatarColorized
          size="small"
          text={name}
          colorizedProp={BACKGROUND_COLOR}
        />
      </ListItemAvatar>
      <ListItemText
        primary={name}
        primaryTypographyProps={{
          color: 'textPrimary',
          noWrap: true,
          variant: 'body2',
        }}
        secondary={secondary}
        secondaryTypographyProps={{
          color: 'textSecondary',
          variant: 'body2',
        }}
        {...listItemTextProps}
      />
      {children}
    </ListItem>
  );
});

ListItemOrganization.propTypes = {
  name: PropTypes.string,
  secondary: PropTypes.node,
  children: PropTypes.node,
  listItemTextProps: PropTypes.object,
};

ListItemOrganization.defaultProps = {
  name: '',
  secondary: null,
  children: null,
  listItemTextProps: {},
};

export default ListItemOrganization;
