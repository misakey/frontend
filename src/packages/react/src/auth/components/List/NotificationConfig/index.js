import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { NOTIFICATIONS } from '@misakey/ui/constants/notifications';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// COMPONENTS
const ListNotificationConfigItem = ({ value, onClick, t, ...rest }) => {
  const onItemClick = useCallback(
    (e) => onClick(e, value),
    [onClick, value],
  );

  return (
    <ListItem
      button
      divider
      onClick={onItemClick}
      {...omitTranslationProps(rest)}
    >
      <ListItemText
        primary={t(`components:list.notificationConfig.${value}.title`)}
        secondary={t(`components:list.notificationConfig.${value}.subtitle`)}
        primaryTypographyProps={{ color: 'textPrimary' }}
        secondaryTypographyProps={{ color: 'textSecondary' }}
      />
      <ChevronRightIcon />
    </ListItem>
  );
};

ListNotificationConfigItem.propTypes = {
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

const ListNotificationConfigItemWithTranslation = withTranslation('components')(ListNotificationConfigItem);

const ListNotificationConfig = ({ onChange, listItemProps, value, ...rest }) => (
  <List {...rest}>
    {NOTIFICATIONS.map((notificationKey) => (
      <ListNotificationConfigItemWithTranslation
        key={notificationKey}
        value={notificationKey}
        onClick={onChange}
        selected={value === notificationKey}
        {...listItemProps}
      />
    ))}
  </List>
);

ListNotificationConfig.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  listItemProps: PropTypes.object,
};

ListNotificationConfig.defaultProps = {
  listItemProps: {},
};

export default ListNotificationConfig;
