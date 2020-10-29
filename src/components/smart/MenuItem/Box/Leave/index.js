import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';

import MenuItem from '@material-ui/core/MenuItem';
import DialogBoxesLeave from 'components/smart/Dialog/Boxes/Leave';

// COMPONENTS
const MenuItemBoxLeave = ({ box, t }) => {
  const [open, setOpen] = useState(false);

  const onClick = useCallback(
    () => {
      setOpen(true);
    },
    [setOpen],
  );

  const onClose = useCallback(
    () => {
      setOpen(false);
    },
    [setOpen],
  );

  return (
    <>
      <MenuItem
        button
        divider
        onClick={onClick}
        aria-label={t('boxes:read.details.menu.leave.primary')}
      >
        {t('boxes:read.details.menu.leave.primary')}
      </MenuItem>
      <DialogBoxesLeave
        open={open}
        onClose={onClose}
        onSuccess={onClose}
        box={box}
      />
    </>
  );
};

MenuItemBoxLeave.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(MenuItemBoxLeave);
