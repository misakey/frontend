import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { OWNER_COMMENTS } from 'constants/databox/comment';
import { ownerCommentValidationSchema } from 'constants/validationSchemas/comment';

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
  ownerComment: '',
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
const DialogDataboxArchive = ({ onClose, onSuccess, open, t }) => {
  const classes = useStyles();

  const secondary = useMemo(
    () => ({
      onClick: onClose,
      text: t('common__new:cancel'),
    }),
    [onClose, t],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="databox-archive-dialog-title"
      aria-describedby="databox-archive-dialog-description"
    >
      <Formik
        onSubmit={onSuccess}
        validationSchema={ownerCommentValidationSchema}
        initialValues={INITIAL_VALUES}
      >
        <Form>
          <DialogTitle id="databox-archive-dialog-title">
            {t('citizen__new:application.info.vault.closeDialog.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText classes={{ root: classes.dialogContentTextRoot }} id="databox-archive-dialog-description">
              {t('citizen__new:application.info.vault.closeDialog.description')}
            </DialogContentText>
            <Field
              component={FieldText}
              select
              name="ownerComment"
              variant="outlined"
              id="owner-comment"
              fullWidth
              label={t('fields__new:ownerComment.label')}
              helperText={t('fields__new:ownerComment.helperText')}
            >
              {OWNER_COMMENTS.map((comment) => (
                <MenuItem classes={{ root: classes.menuItemRoot }} key={comment} value={comment}>
                  {t(`common__new:databox.ownerComment.${comment}`)}
                </MenuItem>
              ))}
            </Field>
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common__new:archive'),
              }}
              secondary={secondary}
              formik
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>

  );
};

DialogDataboxArchive.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common__new', 'fields__new', 'citizen__new'])(DialogDataboxArchive);
