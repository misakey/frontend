import React, { useState, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';

import isFunction from '@misakey/helpers/isFunction';

import MenuItem from '@material-ui/core/MenuItem';
import DialogBoxesLeave from 'components/smart/Dialog/Boxes/Leave';

import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';

// COMPONENTS
const MenuItemBoxLeave = forwardRef(({ box, onClose, t }, ref) => {
  const [open, setOpen] = useState(false);

  const onClick = useCallback(
    () => {
      setOpen(true);
    },
    [setOpen],
  );

  const handleClose = useCallback(
    () => {
      setOpen(false);
      if (isFunction(onClose)) {
        onClose();
      }
    },
    [setOpen, onClose],
  );

  return (
    <>
      <MenuItem
        ref={ref}
        button
        divider
        onClick={onClick}
        aria-label={t('boxes:read.details.menu.leave.primary')}
      >
        <MeetingRoomIcon />
        {t('boxes:read.details.menu.leave.primary')}
      </MenuItem>
      <DialogBoxesLeave
        open={open}
        onClose={handleClose}
        box={box}
      />
    </>
  );
});

MenuItemBoxLeave.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onClose: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

MenuItemBoxLeave.defaultProps = {
  onClose: null,
};

export default withTranslation('boxes')(MenuItemBoxLeave);
