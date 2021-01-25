import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventSchema from 'store/schemas/Boxes/Events';

import { useBoxEditEventContext } from 'components/smart/Box/Event/Edit/Context';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import EditIcon from '@material-ui/icons/Edit';

const MenuItemEditEvent = forwardRef(({ t, event }, ref) => {
  const { editEvent } = useBoxEditEventContext();

  const onClick = useCallback(
    () => {
      setTimeout(() => {
        editEvent(event);
      });
    },
    [editEvent, event],
  );

  return (
    <ContextMenuItem ref={ref} onClick={onClick}>
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:edit')} />
    </ContextMenuItem>
  );
});

MenuItemEditEvent.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('common', { withRef: true })(MenuItemEditEvent);
