import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import MailIcon from '@material-ui/icons/Mail';

const ListItemMailProvidersManual = ({ t, icon, ...rest }) => (
  <ListItem
    button
    divider
    aria-label={t('citizen__new:contact.providers.manual.send', 'Send Manually')}
    {...omitTranslationProps(rest)}
  >
    <ListItemAvatar>
      <Avatar alt={t('citizen__new:contact.providers.manual.send', 'Send Manually')}>
        <MailIcon />
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={t('citizen__new:contact.providers.manual.title')}
      primaryTypographyProps={{
        variant: 'h6',
        color: 'textSecondary',
      }}
      secondary={t('citizen__new:contact.providers.manual.subtitle')}
      secondaryTypographyProps={{
        variant: 'subtitle1',
        color: 'textSecondary',
      }}
    />
    {icon}
  </ListItem>
);

ListItemMailProvidersManual.propTypes = {
  t: PropTypes.func.isRequired,
  icon: PropTypes.node,
};

ListItemMailProvidersManual.defaultProps = {
  icon: null,
};

export default withTranslation('citizen__new')(ListItemMailProvidersManual);
