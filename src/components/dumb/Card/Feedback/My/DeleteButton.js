import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import ConfirmationDialog from 'components/dumb/Dialog/Confirm';

import DeleteIcon from '@material-ui/icons/Delete';

const DeleteMyFeedbackButton = ({ t, deleteMyFeedback }) => {
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  const handleDeletionRequest = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <ConfirmationDialog
        onConfirm={deleteMyFeedback}
        isDialogOpen={isDialogOpen}
        setDialogOpen={setDialogOpen}
        title={t('feedback.delete.title')}
        dialogContent={t('feedback.delete.message')}
      />
      <Tooltip title={t('feedback.delete.button')}>
        <IconButton
          color="primary"
          aria-label="delete"
          component="span"
          onClick={handleDeletionRequest}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

DeleteMyFeedbackButton.propTypes = {
  deleteMyFeedback: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(DeleteMyFeedbackButton);
