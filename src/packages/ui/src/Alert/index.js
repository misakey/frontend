import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import isNil from '@misakey/helpers/isNil';

function Alert({ children, dialogActions, dialogProps, onClose, onOk, open, t, text, title }) {
  return (
    <Dialog
      {...dialogProps}
      open={open}
      onClose={onClose}
    >
      {!isNil(title) && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}
      {(!isNil(text) || children) && (
        <DialogContent>
          {!isNil(text) && (
            <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
          )}
          {children}
        </DialogContent>
      )}
      <DialogActions>
        {dialogActions}
        {dialogActions.length === 0 && (
          <>
            <Button onClick={onClose}>{t('common:cancel')}</Button>
            <Button onClick={onOk} color="primary" autoFocus>{t('common:ok')}</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

Alert.propTypes = {
  children: PropTypes.node,
  dialogActions: PropTypes.node,
  dialogProps: PropTypes.objectOf(PropTypes.any),
  onClose: PropTypes.func.isRequired,
  onOk: PropTypes.func,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func,
  text: PropTypes.string,
  title: PropTypes.string,
};

Alert.defaultProps = {
  children: null,
  dialogActions: [],
  dialogProps: {},
  onOk: () => false,
  t: (key) => key,
  text: '',
  title: '',
};

export default withTranslation('common')(Alert);
