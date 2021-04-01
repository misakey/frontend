import React, { useState, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventSchema from 'store/schemas/Boxes/Events';

import isNil from '@misakey/core/helpers/isNil';

import { useBoxEditEventContext } from 'components/smart/Box/Event/Edit/Context';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DialogEventDelete from 'components/dumb/Dialog/Event/Delete';

import DeleteIcon from '@material-ui/icons/Delete';


// COMPONENTS
const MenuItemDeleteEvent = forwardRef(({ t, event, boxId }, ref) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { id: eventId } = useSafeDestr(event);

  const { event: editingEvent, clearEvent } = useBoxEditEventContext();

  const onDelete = useCallback(
    () => (event === editingEvent
      ? clearEvent()
      : Promise.resolve()),
    [clearEvent, editingEvent, event],
  );

  const onOpen = useCallback(
    () => {
      setIsDialogOpen(true);
    },
    [setIsDialogOpen],
  );

  const onClose = useCallback(
    (e) => {
      if (!isNil(e) && e.stopPropagation) {
        e.stopPropagation();
      }
      setIsDialogOpen(false);
    },
    [setIsDialogOpen],
  );

  return (
    <ContextMenuItem ref={ref} onClick={onOpen}>
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:delete')} />
      <DialogEventDelete
        boxId={boxId}
        eventId={eventId}
        onDelete={onDelete}
        onClose={onClose}
        isDialogOpen={isDialogOpen}
      />
    </ContextMenuItem>
  );
});

MenuItemDeleteEvent.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  boxId: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'], { withRef: true })(MenuItemDeleteEvent);
