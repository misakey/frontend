import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import AvatarUser from '@misakey/ui/Avatar/User';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

// COMPONENTS
const ListItemUser = ({
  displayName, avatarUrl, identifier, isMe, children, t, classes, ...rest
}) => {
  const { listItemText, ...listItemClasses } = useSafeDestr(classes);
  return (
    <ListItem classes={listItemClasses} {...omitTranslationProps(rest)}>
      <ListItemAvatar>
        <AvatarUser displayName={displayName} identifier={identifier} avatarUrl={avatarUrl} />
      </ListItemAvatar>
      <ListItemText
        className={listItemText}
        primary={isMe ? t('common:you', { displayName }) : displayName}
        secondary={identifier}
        primaryTypographyProps={{ color: 'textPrimary', noWrap: true }}
        secondaryTypographyProps={{ color: 'textSecondary' }}
      />
      {children}
    </ListItem>
  );
};
ListItemUser.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
  isMe: PropTypes.bool,
  children: PropTypes.node,
  classes: PropTypes.shape({
    listItemText: PropTypes.string,
  }),
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  children: null,
  isMe: false,
  classes: {
    listItemText: '',
  },
};

export default withTranslation('common')(ListItemUser);
