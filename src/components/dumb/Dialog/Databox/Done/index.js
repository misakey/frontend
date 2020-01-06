import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { DPO_COMMENTS } from 'constants/databox/comment';
import { dpoCommentValidationSchema } from 'constants/validationSchemas/comment';

import { Formik, Form, Field } from 'formik';
import FieldText from 'components/dumb/Form/Field/Text';
import MenuItem from '@material-ui/core/MenuItem';
import BoxControls from 'components/dumb/Box/Controls';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// CONSTANTS
const INITIAL_VALUES = {
  dpoComment: '',
};

// HOOKS
const useStyles = makeStyles(() => ({
  dialogContentTextRoot: {
    whiteSpace: 'pre-wrap',
  },
  menuItemRoot: {
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const DialogDataboxDone = ({ onClose, onSuccess, open, t }) => {
  const classes = useStyles();

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
      aria-labelledby="databox-done-dialog-title"
      aria-describedby="databox-done-dialog-description"
    >
      <Formik
        onSubmit={onSuccess}
        validationSchema={dpoCommentValidationSchema}
        initialValues={INITIAL_VALUES}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <DialogTitle id="databox-done-dialog-title">
              {t('common:databox.dialog.done.title')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText classes={{ root: classes.dialogContentTextRoot }} id="databox-done-dialog-description">
                {t('common:databox.dialog.done.description')}
              </DialogContentText>
              <Field
                component={FieldText}
                select
                name="dpoComment"
                variant="outlined"
                id="owner-comment"
                fullWidth
                label={t('fields:dpoComment.label')}
                helperText={t('fields:dpoComment.helperText')}
              >
                {DPO_COMMENTS.map((comment) => (
                  <MenuItem classes={{ root: classes.menuItemRoot }} key={comment} value={comment}>
                    &quot;
                    {t(`common:databox.dpoComment.${comment}`)}
                    &quot;
                  </MenuItem>
                ))}
              </Field>
            </DialogContent>
            <DialogActions>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:done'),
                  isValid,
                  isLoading: isSubmitting,
                }}
                secondary={secondary}
                outlined={false}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>

  );
};

DialogDataboxDone.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'fields'])(DialogDataboxDone);
