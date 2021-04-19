import React, { useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventSchema from 'store/schemas/Boxes/Events';

import { useBoxEditEventContext } from 'components/smart/Box/Event/Edit/Context';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import EditIcon from '@material-ui/icons/Edit';

const MenuItemEditEvent = forwardRef(({ t, event, component: Component }, ref) => {
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
    <Component ref={ref} onClick={onClick}>
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:edit')} />
    </Component>
  );
});

MenuItemEditEvent.propTypes = {
  component: PropTypes.elementType,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

MenuItemEditEvent.defaultProps = {
  component: ContextMenuItem,
};

export default withTranslation('common', { withRef: true })(MenuItemEditEvent);
