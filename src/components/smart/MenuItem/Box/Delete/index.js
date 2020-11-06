import React, { useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';

import isFunction from '@misakey/helpers/isFunction';

import MenuItem from '@material-ui/core/MenuItem';
import DialogBoxesDelete from 'components/smart/Dialog/Boxes/Delete';

// COMPONENTS
const MenuItemBoxDelete = forwardRef(({ box, onClose, t }, ref) => {
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
        aria-label={t('boxes:read.details.menu.delete.primary')}
      >
        {t('boxes:read.details.menu.delete.primary')}
      </MenuItem>
      <DialogBoxesDelete
        open={open}
        onClose={handleClose}
        onSuccess={handleClose}
        box={box}
      />
    </>
  );
});

MenuItemBoxDelete.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onClose: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

MenuItemBoxDelete.defaultProps = {
  onClose: null,
};

export default withTranslation('boxes')(MenuItemBoxDelete);
