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
const ListItemTOS = ({ t, ...props }) => (
  <ListItem {...omitTranslationProps(props)}>
    <ListItemText primary={t('auth:tos.text')} />
    <ListItemSecondaryAction>
      <IconButton
        aria-label={t('auth:tos.button')}
        href={t('auth:tos.href')}
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
  t: PropTypes.func.isRequired,
};

export default withTranslation('auth')(ListItemTOS);
