import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';

import { useHistory } from 'react-router-dom';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import DeleteBoxDialog from 'components/smart/Dialog/Boxes/Delete';

function DeleteBoxDialogButton({ box, t }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { replace } = useHistory();

  const onClick = useCallback(
    () => {
      setIsDialogOpen(true);
    },
    [setIsDialogOpen],
  );

  const onClose = useCallback(
    () => {
      setIsDialogOpen(false);
    },
    [setIsDialogOpen],
  );

  const onSuccess = useCallback(
    () => {
      onClose();
      replace(routes.boxes._);
      return Promise.resolve();
    },
    [onClose, replace],
  );

  return (
    <>
      <Button
        onClick={onClick}
        standing={BUTTON_STANDINGS.MAIN}
        text={t('common:delete')}
      />
      <DeleteBoxDialog
        box={box}
        open={isDialogOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </>
  );
}

DeleteBoxDialogButton.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(DeleteBoxDialogButton);
