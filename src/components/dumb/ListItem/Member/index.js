import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import SenderSchema from 'store/schemas/Boxes/Sender';
import BoxSchema from 'store/schemas/Boxes';

import { sendersMatch } from 'helpers/sender';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import AvatarUser from '@misakey/ui/Avatar/User';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Chip from '@material-ui/core/Chip';

// COMPONENTS
const ListItemMember = ({ member, box, belongsToCurrentUser, t, ...rest }) => {
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
      <ListItemAvatar>
        <AvatarUser displayName={displayName} avatarUrl={avatarUrl} />
      </ListItemAvatar>
      <ListItemText
        primary={displayName}
        secondary={belongsToCurrentUser ? identifierValue : null}
        primaryTypographyProps={{ color: 'textPrimary' }}
        secondaryTypographyProps={{ color: 'textSecondary' }}
      />
      {isMemberCreator && <Chip label={t('boxes:read.details.menu.members.creator.title')} />}
      {isMemberSubject && <Chip label={t('boxes:read.details.menu.members.subject')} />}
    </ListItem>
  );
};

ListItemMember.propTypes = {
  member: PropTypes.shape(SenderSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
  belongsToCurrentUser: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemMember.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['boxes'])(ListItemMember);
