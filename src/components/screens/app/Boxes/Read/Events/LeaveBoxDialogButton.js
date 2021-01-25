import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';

import { useHistory } from 'react-router-dom';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import LeaveBoxDialog from 'components/smart/Dialog/Boxes/Leave';

// CONSTANTS

// COMPONENTS
function LeaveBoxDialogButton({ box, t }) {
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
    () => replace(routes.boxes._),
    [replace],
  );

  return (
    <>
      <Button
        onClick={onClick}
        standing={BUTTON_STANDINGS.TEXT}
        text={t('common:leave')}
      />
      <LeaveBoxDialog
        box={box}
        open={isDialogOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </>
  );
}

LeaveBoxDialogButton.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(LeaveBoxDialogButton);
