import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// CONSTANTS
const PRIMARY_TYPOGRAPHY_PROPS = {
  color: 'textSecondary',
  variant: 'body2',
};

const SECONDARY_TYPOGRAPHY_PROPS = {
  color: 'textPrimary',
  variant: 'body1',
};

// COMPONENTS
const ListItemIdentifier = ({ identifier, ...props }) => {
  const { t } = useTranslation('common');

  return (
    <ListItem {...props}>
      <ListItemText
        primary={t('common:identifier')}
        primaryTypographyProps={PRIMARY_TYPOGRAPHY_PROPS}
        secondary={identifier}
        secondaryTypographyProps={SECONDARY_TYPOGRAPHY_PROPS}
      />
    </ListItem>
  );
};

ListItemIdentifier.propTypes = {
  identifier: PropTypes.string,
};

ListItemIdentifier.defaultProps = {
  identifier: '',
};

export default ListItemIdentifier;
