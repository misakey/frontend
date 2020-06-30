import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Form, Field, FieldArray } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

// import { serviceRequestsReadValidationSchema } from 'constants/validationSchemas/dpo';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import { makeStyles } from '@material-ui/core/styles/';
import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import encryptFile from '@misakey/crypto/box/encryptFile';

import FieldBlobs from 'components/smart/Dialog/Boxes/Upload/BlobsField';
import FieldBlobTmp from 'components/smart/Dialog/Boxes/Upload/TmpBlobField';
import BoxControls from '@misakey/ui/Box/Controls';
import { createBoxEncryptedFileBuilder } from '@misakey/helpers/builder/boxes';

import { addBoxEvents } from 'store/reducers/box';
import BoxesSchema from 'store/schemas/Boxes';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { removeEntities } from '@misakey/store/actions/entities';

export const TMP_BLOB_FIELD_NAME = 'blob';
export const BLOBS_FIELD_NAME = 'blobs';
export const INITIAL_VALUES = { [TMP_BLOB_FIELD_NAME]: null, [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = {};
const { conflict } = errorTypes;

// HOOKS
const useStyles = makeStyles((theme) => ({
  mkAgentLink: {
    fontWeight: 'bold',
    color: 'inherit',
  },
  dialogContentRoot: {
    padding: theme.spacing(3),
  },
}));

function UploadDialog({
  box,
  t,
  onClose,
  onSuccess,
  open,
}) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();

  const { enqueueSnackbar } = useSnackbar();
  const [newBlob, setNewBlob] = useState(null);

  const dispatch = useDispatch();

  const { publicKey, id: boxId } = box;

  const handleUpload = useCallback(
    async (file) => {
      const { encryptedFile, encryptedMessageContent } = await encryptFile(file, publicKey);

      const formData = new FormData();
      formData.append('encrypted_file', encryptedFile);
      formData.append('msg_encrypted_content', encryptedMessageContent);
      formData.append('msg_public_key', publicKey);

      try {
        const response = await createBoxEncryptedFileBuilder(boxId, formData);

        dispatch(addBoxEvents(boxId, response));

        if (onSuccess) {
          return onSuccess(response);
        }

        return response;
      } catch (error) {
        if (error.code === conflict) {
          const { details = {} } = error;
          if (details.lifecycle === conflict) {
            dispatch(removeEntities([{ id: boxId }], BoxesSchema));
            enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
          }
        }
        throw error;
      }
    },
    [publicKey, boxId, dispatch, onSuccess, enqueueSnackbar, t],
  );

  const getOnReset = useCallback(
    (resetForm) => () => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  const onSubmit = useCallback(
    async (form, { resetForm, setStatus }) => {
      const blobs = form[BLOBS_FIELD_NAME];

      // Could be improved later with a backend endpoint to upload several files at a time
      const newBlobList = await Promise.all(blobs.map(
        ({ blob, ...rest }) => handleUpload(blob)
          .then(() => ({ ...rest, blob, isSent: true }))
          .catch((e) => {
            log(e, 'error');
            return { ...rest, blob, error: e };
          }),
      ));

      const errors = newBlobList.filter(({ error }) => !isNil(error));
      resetForm();

      if (isEmpty(errors)) {
        const text = t('boxes:read.upload.success');
        enqueueSnackbar(text, { variant: 'success' });
        onClose();
      } else {
        setStatus({ [BLOBS_FIELD_NAME]: newBlobList });
      }
    },
    [enqueueSnackbar, handleUpload, onClose, t],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="upload-dialog-title"
      aria-describedby="upload-dialog-description"
    >
      <Formik
        // validationSchema={serviceRequestsReadValidationSchema}
        initialValues={INITIAL_VALUES}
        initialStatus={INITIAL_STATUS}
        onSubmit={onSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <DialogTitleWithClose onClose={getOnReset(resetForm)} />
            <DialogContent className={classes.dialogContentRoot}>
              {/* @FIXME This could be improved by updating useFileReader
              and FieldFile to handle multiple files */}
              <FieldArray
                name={BLOBS_FIELD_NAME}
                render={(arrayHelpers) => (
                  <FieldBlobs
                    setNewBlob={setNewBlob}
                    newBlob={newBlob}
                    {...arrayHelpers}
                  />
                )}
              />
              <Field
                name={TMP_BLOB_FIELD_NAME}
                component={FieldBlobTmp}
                setNewBlob={setNewBlob}
              />

            </DialogContent>
            <DialogActions>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:send'),
                }}
                formik
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>

  );
}

UploadDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {
  // request: null,
  open: false,
};

export default withTranslation(['common', 'boxes'])(UploadDialog);
