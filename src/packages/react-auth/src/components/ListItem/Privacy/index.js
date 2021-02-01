import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import DescriptionIcon from '@material-ui/icons/Description';

// COMPONENTS
const ListItemPrivacy = ({ t, href, ...props }) => (
  <ListItem {...omitTranslationProps(props)}>
    <ListItemText primary={t('auth:privacy.text')} primaryTypographyProps={{ color: 'textPrimary' }} />
    <ListItemSecondaryAction>
      <IconButton
        aria-label={t('auth:privacy.button')}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        color="primary"
      >
        <DescriptionIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
);

ListItemPrivacy.propTypes = {
  href: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('auth')(ListItemPrivacy);
