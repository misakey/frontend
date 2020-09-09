import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ShareBoxDialog from 'components/smart/Dialog/Boxes/Share';

function ShareBoxDialogButton({ box, t }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  return (
    <>
      <Button
        onClick={onClick}
        standing={BUTTON_STANDINGS.MAIN}
        text={t('common:share')}
      />
      <ShareBoxDialog
        box={box}
        open={isDialogOpen}
        onClose={onClose}
      />
    </>
  );
}

ShareBoxDialogButton.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ShareBoxDialogButton);
