import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import { useDialogBoxesDeleteContext } from 'components/smart/Dialog/Boxes/Delete/Context';

import ButtonShortcut from '@misakey/ui/Button/Shortcut';

import DeleteIcon from '@material-ui/icons/Delete';

// COMPONENTS
const IconButtonBoxesDelete = forwardRef(({ box, ...props }, ref) => {
  const { t } = useTranslation('boxes');

  const label = useMemo(
    () => t('boxes:read.details.menu.delete.primary'),
    [t],
  );

  const { onOpen } = useDialogBoxesDeleteContext();

  return (
    <ButtonShortcut
      ref={ref}
      onClick={onOpen}
      label={label}
      {...props}
    >
      <DeleteIcon color="action" />
    </ButtonShortcut>
  );
});

IconButtonBoxesDelete.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesDelete;
