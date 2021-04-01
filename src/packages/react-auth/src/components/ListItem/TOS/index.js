import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import DescriptionIcon from '@material-ui/icons/Description';
// COMPONENTS
const ListItemTOS = ({ t, href, ...props }) => (
  <ListItem {...omitTranslationProps(props)}>
    <ListItemText primary={t('auth:tos.text')} primaryTypographyProps={{ color: 'textPrimary' }} />
    <ListItemSecondaryAction>
      <IconButton
        href={href}
        aria-label={t('auth:tos.button')}
        target="_blank"
        rel="noopener noreferrer"
        color="primary"
      >
        <DescriptionIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
);

ListItemTOS.propTypes = {
  href: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('auth')(ListItemTOS);
