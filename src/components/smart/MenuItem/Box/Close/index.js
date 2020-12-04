import { useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';

import isFunction from '@misakey/helpers/isFunction';

import MenuItem from '@material-ui/core/MenuItem';
import DialogBoxClose from 'components/smart/Dialog/Boxes/Close';

// COMPONENTS
const MenuItemBoxClose = forwardRef(({ box, onClose, t }, ref) => {
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
        aria-label={t('boxes:read.details.menu.close.primary')}
      >
        {t('boxes:read.details.menu.close.primary')}
      </MenuItem>
      <DialogBoxClose
        open={open}
        onClose={handleClose}
        box={box}
      />
    </>
  );
});

MenuItemBoxClose.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onClose: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

MenuItemBoxClose.defaultProps = {
  onClose: null,
};

export default withTranslation('boxes')(MenuItemBoxClose);
