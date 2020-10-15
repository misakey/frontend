import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import SenderSchema from 'store/schemas/Boxes/Sender';
import BoxSchema from 'store/schemas/Boxes';

import { identifierValuePath, senderMatchesIdentifierId, sendersIdentifiersMatch } from 'helpers/sender';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useModifier from '@misakey/hooks/useModifier';

import AvatarUser from '@misakey/ui/Avatar/User';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Chip from '@material-ui/core/Chip';

// CONSTANTS
const { identifierId: IDENTIFIER_ID_SELECTOR } = authSelectors;

// COMPONENTS
const ListItemMember = ({ member, box, t }) => {
  const { displayName, avatarUrl } = useSafeDestr(member);
  const { creator } = useSafeDestr(box);
  const memberIdentifierValue = useModifier(identifierValuePath, member);
  const myIdentifierId = useSelector(IDENTIFIER_ID_SELECTOR);

  const isCurrentUserAdmin = useMemo(
    () => senderMatchesIdentifierId(creator, myIdentifierId),
    [creator, myIdentifierId],
  );
  const isMemberAdmin = useMemo(
    () => sendersIdentifiersMatch(creator, member),
    [creator, member],
  );

  return (
    <ListItem>
      <ListItemAvatar>
        <AvatarUser displayName={displayName} avatarUrl={avatarUrl} />
      </ListItemAvatar>
      <ListItemText
        primary={displayName}
        secondary={isCurrentUserAdmin ? memberIdentifierValue : null}
        primaryTypographyProps={{ color: 'textPrimary' }}
        secondaryTypographyProps={{ color: 'textSecondary' }}
      />
      {isMemberAdmin && <Chip label={t('boxes:read.details.menu.members.admin')} />}
    </ListItem>
  );
};

ListItemMember.propTypes = {
  member: PropTypes.shape(SenderSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes'])(ListItemMember);
