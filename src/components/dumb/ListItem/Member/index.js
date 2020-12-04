import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import SenderSchema from 'store/schemas/Boxes/Sender';
import BoxSchema from 'store/schemas/Boxes';

import { identifierValuePath, sendersMatch } from 'helpers/sender';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useModifier from '@misakey/hooks/useModifier';

import AvatarUser from '@misakey/ui/Avatar/User';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Chip from '@material-ui/core/Chip';

// COMPONENTS
const ListItemMember = ({ member, box, belongsToCurrentUser, t, ...rest }) => {
  const { displayName, avatarUrl } = useSafeDestr(member);
  const { creator } = useSafeDestr(box);
  const memberIdentifierValue = useModifier(identifierValuePath, member);

  const isMemberAdmin = useMemo(
    () => sendersMatch(creator, member),
    [creator, member],
  );

  return (
    <ListItem {...omitTranslationProps(rest)}>
      <ListItemAvatar>
        <AvatarUser displayName={displayName} avatarUrl={avatarUrl} />
      </ListItemAvatar>
      <ListItemText
        primary={displayName}
        secondary={belongsToCurrentUser ? memberIdentifierValue : null}
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
  belongsToCurrentUser: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemMember.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['boxes'])(ListItemMember);
