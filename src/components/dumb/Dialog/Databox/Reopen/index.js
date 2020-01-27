import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';

import BoxControls from 'components/dumb/Box/Controls';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// HOOKS
const useStyles = makeStyles(() => ({
  dialogContentTextRoot: {
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const DialogDataboxReopen = ({ onClose, onSuccess, open, t }) => {
  const classes = useStyles();

  const primary = useMemo(
    () => ({
      onClick: onSuccess,
      text: t('common:reopen'),
    }),
    [onSuccess, t],
  );

  const secondary = useMemo(
    () => ({
      onClick: onClose,
      text: t('common:cancel'),
    }),
    [onClose, t],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="databox-reopen-dialog-title"
      aria-describedby="databox-reopen-dialog-description"
    >
      <DialogTitle id="databox-reopen-dialog-title">
        {t('common:databox.dialog.reopen.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText classes={{ root: classes.dialogContentTextRoot }} id="databox-reopen-dialog-description">
          {t('common:databox.dialog.reopen.description')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <BoxControls
          primary={primary}
          secondary={secondary}
          outlined={false}
        />
      </DialogActions>
    </Dialog>
  );
};

DialogDataboxReopen.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(DialogDataboxReopen);