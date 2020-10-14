import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';

import { AbortError } from 'constants/Errors/classes/Files';
import BoxesSchema from 'store/schemas/Boxes';
import { removeEntities } from '@misakey/store/actions/entities';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { boxFileUploadValidationSchema } from 'constants/validationSchemas/boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import fileToBlob from '@misakey/helpers/fileToBlob';
import prop from '@misakey/helpers/prop';
import pluck from '@misakey/helpers/pluck';
import compose from '@misakey/helpers/compose';
import log from '@misakey/helpers/log';
import uniqBy from '@misakey/helpers/uniqBy';
import partition from '@misakey/helpers/partition';
import promiseAllNoFailFast from '@misakey/helpers/promiseAllNoFailFast';
import { makeAbortableCreateBoxEncryptedFileWithProgress } from '@misakey/helpers/builder/boxes';
import workerEncryptFile from '@misakey/crypto/box/encryptFile/worker';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUploadStatus from 'hooks/useUploadStatus';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogContent from '@material-ui/core/DialogContent';
import FormHelperText from '@material-ui/core/FormHelperText';
import DialogContentText from '@material-ui/core/DialogContentText';
import FieldFiles from 'components/dumb/Form/Field/Files';
import BoxControls from '@misakey/ui/Box/Controls';
import Link from '@material-ui/core/Link';
import FieldBlobs from './BlobsField';

// CONSTANTS
export const BLOBS_FIELD_NAME = 'files';
const BLOBS_FIELD_PREFIX = 'blobs_';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = {};
const { conflict } = errorTypes;

// HELPERS
const errorPropNil = compose(
  (e) => isNil(e),
  prop('error'),
);

const uniqBlob = (list) => uniqBy(list, 'key');

const isInProgress = compose(
  (values) => values.some((value) => isNil(value) || value < 100),
  Object.values,
  pluck('progress'),
);

// HOOKS
const useStyles = makeStyles((theme) => ({
  mkAgentLink: {
    fontWeight: 'bold',
    color: 'inherit',
  },
  dialogContentRoot: {
    padding: theme.spacing(3),
  },
  dialogContentTextRoot: {
    textAlign: 'center',
  },
}));

function UploadDialog({
  box,
  t,
  onClose,
  onSuccess,
  open,
  initialValues,
  fileTransform,
  autoFocus,
}) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const [
    blobsUploadStatus,
    { onProgress, onEncrypt, onUpload, onDone, onAbortable, onReset },
  ] = useUploadStatus();

  const isUploading = useMemo(
    () => (!isEmpty(blobsUploadStatus) || isInProgress(blobsUploadStatus)),
    [blobsUploadStatus],
  );

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const { publicKey, id: boxId } = box;

  const handleClose = useCallback(
    () => {
      if (!isUploading) {
        return onClose();
      }
      return enqueueSnackbar(t('boxes:read.upload.progress'), { variant: 'warning', preventDuplicate: true });
    },
    [isUploading, onClose, enqueueSnackbar, t],
  );

  const handleUpload = useCallback(
    async (file, index) => {
      const onFileProgress = onProgress(index);

      onEncrypt(index);
      const { encryptedFile, encryptedMessageContent } = await workerEncryptFile(file, publicKey);
      onUpload(index);

      const formData = new FormData();
      formData.append('encrypted_file', encryptedFile);
      formData.append('msg_encrypted_content', encryptedMessageContent);
      formData.append('msg_public_key', publicKey);

      const { send, req } = makeAbortableCreateBoxEncryptedFileWithProgress(
        boxId, formData, onFileProgress,
      );
      onAbortable(index, req);
      try {
        const response = await send();
        if (response.type === 'abort') {
          throw new AbortError();
        }
        onDone(index);

        if (isFunction(onSuccess)) {
          onSuccess(response);
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
    [
      publicKey, boxId, dispatch, onSuccess, enqueueSnackbar, t,
      onEncrypt, onUpload, onProgress, onDone, onAbortable,
    ],
  );

  const getOnReset = useCallback(
    (resetForm) => () => {
      if (!isUploading) {
        resetForm({ values: INITIAL_VALUES });
      }
      handleClose();
    },
    [isUploading, handleClose],
  );

  const onSubmit = useCallback(
    async (form, { resetForm, setStatus }) => {
      const blobs = form[BLOBS_FIELD_NAME];
      onReset();

      // Could be improved later with a backend endpoint to upload several files at a time
      const newBlobList = await promiseAllNoFailFast(
        blobs
          .map(async ({ blob, abort, ...rest }, index) => {
            try {
              const response = await handleUpload(blob, index);
              return { ...response, ...rest, blob, isSent: true };
            } catch (e) {
              if (e instanceof AbortError) {
                return { ...rest, blob, isSent: false, abort: true };
              }
              log(e, 'error');
              return { ...rest, blob, error: true };
            }
          }),
      );

      const [, errors] = partition(newBlobList, errorPropNil);
      const aborts = newBlobList.filter(({ abort }) => abort === true);
      if (isEmpty(aborts)) {
        resetForm();
      } else {
        resetForm({ values: { [BLOBS_FIELD_NAME]: aborts } });
      }
      onReset();

      if (isEmpty(errors)) {
        if (newBlobList.length > aborts.length) {
          const text = t('boxes:read.upload.success');
          enqueueSnackbar(text, { variant: 'success' });
        }
        if (isEmpty(aborts)) {
          onClose();
        }
      } else {
        setStatus({ [BLOBS_FIELD_NAME]: newBlobList });
      }
    },
    [handleUpload, t, enqueueSnackbar, onClose, onReset],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="upload-dialog-title"
      aria-describedby="upload-dialog-description"
    >
      <Formik
        validationSchema={boxFileUploadValidationSchema}
        initialValues={initialValues}
        initialStatus={INITIAL_STATUS}
        onSubmit={onSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <DialogTitleWithClose onClose={getOnReset(resetForm)}>
              <BoxControls
                ml="auto"
                alignItems="center"
                primary={{
                  type: 'submit',
                  text: t('common:send'),
                }}
                formik
              />
            </DialogTitleWithClose>
            <DialogContent className={classes.dialogContentRoot}>
              <FieldFiles
                name={BLOBS_FIELD_NAME}
                prefix={BLOBS_FIELD_PREFIX}
                labelText={t('boxes:read.upload.dialog.label')}
                renderItem={(props) => <FieldBlobs {...props} />}
                fileTransform={fileTransform}
                uniqFn={uniqBlob}
                uploadStatus={blobsUploadStatus}
                emptyTitle={(
                  <DialogContentText
                    classes={{ root: classes.dialogContentTextRoot }}
                    id="upload-dialog-description"
                  >
                    {t('boxes:read.upload.dialog.text')}
                  </DialogContentText>
                )}
                autoFocus={autoFocus}
              />
              <FormHelperText>
                {t('boxes:read.upload.dialog.helperText')}
                &nbsp;
                <Link
                  href={t('boxes:read.upload.dialog.helperLink')}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="secondary"
                >
                  {t('boxes:read.upload.dialog.helperLinkText')}
                </Link>
              </FormHelperText>
            </DialogContent>
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
  onSuccess: PropTypes.func,
  initialValues: PropTypes.object,
  fileTransform: PropTypes.func,
  autoFocus: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {
  // request: null,
  open: false,
  initialValues: INITIAL_VALUES,
  fileTransform: fileToBlob,
  autoFocus: false,
  onSuccess: null,
};

export default withTranslation(['common', 'boxes'])(UploadDialog);
