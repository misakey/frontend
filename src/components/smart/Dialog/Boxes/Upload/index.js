import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field, FieldArray } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import DataboxSchema from 'store/schemas/Databox';

import { serviceRequestsReadValidationSchema } from 'constants/validationSchemas/dpo';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import last from '@misakey/helpers/last';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';

import { encryptBlobFile } from '@misakey/crypto/databox/crypto';

import { makeStyles } from '@material-ui/core/styles/';
import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from 'components/dumb/Dialog/Title/WithCloseIcon';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import FieldBlobs from 'components/smart/Dialog/Boxes/Upload/BlobsField';
import FieldBlobTmp from 'components/smart/Dialog/Boxes/Upload/TmpBlobField';
import BoxControls from 'components/dumb/Box/Controls';

export const TMP_BLOB_FIELD_NAME = 'blob';
export const BLOBS_FIELD_NAME = 'blobs';
export const INITIAL_VALUES = { [TMP_BLOB_FIELD_NAME]: null, [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = {};

// HELPERS
function getFileExtension(fileName) {
  return `.${last(fileName.split('.'))}`;
}

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
  request,
  t,
  onClose,
  onSuccess,
  open,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [newBlob, setNewBlob] = useState(null);

  const { id: requestId, owner } = useMemo(() => request || {}, [request]);

  const { pubkeyData, email: userEmail } = useMemo(
    () => owner || {},
    [owner],
  );

  const handleUpload = useCallback(
    (blob) => encryptBlobFile(blob, pubkeyData)
      .then(({ ciphertext, nonce, ephemeralProducerPubKey }) => {
        const formData = new FormData();
        formData.append('transaction_id', Math.floor(Math.random() * 10000000000));
        formData.append('databox_id', requestId);
        formData.append('data_type', 'all');
        formData.append('file_extension', getFileExtension(blob.name));
        formData.append('blob', ciphertext);
        formData.append('encryption[algorithm]', 'com.misakey.nacl-box');
        formData.append('encryption[nonce]', nonce);
        formData.append('encryption[ephemeral_producer_pub_key]', ephemeralProducerPubKey);
        formData.append('encryption[owner_pub_key]', pubkeyData);

        return API.use(API.endpoints.request.blob.create)
          .build(null, formData)
          .send({ contentType: null })
          .then((response) => onSuccess(objectToCamelCaseDeep(response)));
      }),
    [onSuccess, pubkeyData, requestId],
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
          .catch((e) => ({ ...rest, blob, error: e })),
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
      open={open}
      onClose={onClose}
      aria-labelledby="upload-dialog-title"
      aria-describedby="upload-dialog-description"
    >
      <Formik
        validationSchema={serviceRequestsReadValidationSchema}
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
                userEmail={userEmail}
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
  request: PropTypes.shape(DataboxSchema.propTypes),
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {
  request: null,
  open: false,
};

export default withTranslation(['common', 'boxes'])(UploadDialog);
