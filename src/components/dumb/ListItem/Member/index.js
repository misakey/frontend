import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  AVATAR_SIZE,
  AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';
import UserSchema from '@misakey/react/auth/store/schemas/User';
import BoxSchema from 'store/schemas/Boxes';

import { sendersMatch } from 'helpers/sender';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarUser from '@misakey/ui/Avatar/User';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Chip from '@material-ui/core/Chip';

// HOOKS
const useStyles = makeStyles((theme) => ({
  chipRoot: {
    marginLeft: theme.spacing(1),
    marginBottom: 6, // ListItemText margin bottom
    alignSelf: 'flex-end',
  },
  listItemAvatarRoot: {
    minWidth: AVATAR_SIZE + theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      minWidth: AVATAR_SM_SIZE + theme.spacing(0.5),
    },
  },
}));

// COMPONENTS
const ListItemMember = ({ member, box, belongsToCurrentUser, t, ...rest }) => {
  const classes = useStyles();

  const { displayName, avatarUrl, identifierValue } = useSafeDestr(member);
  const { creator, subject } = useSafeDestr(box);

  const isMemberCreator = useMemo(
    () => sendersMatch(creator, member),
    [creator, member],
  );

  const isMemberSubject = useMemo(
    () => sendersMatch(subject, member),
    [subject, member],
  );

  return (
    <ListItem {...omitTranslationProps(rest)}>
      <ListItemAvatar classes={{ root: classes.listItemAvatarRoot }}>
        <AvatarUser displayName={displayName} avatarUrl={avatarUrl} />
      </ListItemAvatar>
      <ListItemText
        primary={displayName}
        secondary={belongsToCurrentUser ? identifierValue : null}
        primaryTypographyProps={{ color: 'textPrimary' }}
        secondaryTypographyProps={{
          color: 'textSecondary',
          noWrap: true,
        }}
      />
      {isMemberCreator && (
      <Chip
        classes={{ root: classes.chipRoot }}
        label={t('boxes:read.details.menu.members.creator.title')}
        size="small"
      />
      )}
      {isMemberSubject && (
      <Chip
        classes={{ root: classes.chipRoot }}
        label={t('boxes:read.details.menu.members.subject')}
        size="small"
      />
      )}
    </ListItem>
  );
};

ListItemMember.propTypes = {
  member: PropTypes.shape(UserSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
  belongsToCurrentUser: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemMember.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['boxes'])(ListItemMember);
