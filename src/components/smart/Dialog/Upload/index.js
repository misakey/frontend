import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { AbortError } from 'constants/Errors/classes/Files';
import { fileUploadValidationSchema } from 'constants/validationSchemas/files';

import isEmpty from '@misakey/core/helpers/isEmpty';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import fileToBlob from '@misakey/core/helpers/fileToBlob';
import prop from '@misakey/core/helpers/prop';
import pluck from '@misakey/core/helpers/pluck';
import compose from '@misakey/core/helpers/compose';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import uniqBy from '@misakey/core/helpers/uniqBy';
import partition from '@misakey/core/helpers/partition';
import promiseAllNoFailFast from '@misakey/core/helpers/promiseAllNoFailFast';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import isPlainObject from '@misakey/core/helpers/isPlainObject';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUploadStatus from 'hooks/useUploadStatus';

import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogContent from '@material-ui/core/DialogContent';
import FormHelperText from '@material-ui/core/FormHelperText';
import FieldFiles from 'components/dumb/Form/Field/Files';
import BoxControls from '@misakey/ui/Box/Controls';
import Link from '@material-ui/core/Link';
import Formik from '@misakey/ui/Formik';
import FieldBlobs from './BlobsField';

// CONSTANTS
export const BLOBS_FIELD_NAME = 'files';
const BLOBS_FIELD_PREFIX = 'blobs_';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = {};

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
  dialogContentRoot: {
    padding: theme.spacing(3),
  },
}));

function UploadDialog({
  onClose,
  open,
  onSuccess,
  onError,
  onUploadBuilder,
  onEncryptBuilder,
  initialValues,
  initialStatus,
  fileTransform,
  autoFocus,
}) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const { t } = useTranslation('components');
  const [
    blobsUploadStatus,
    { onProgress, onEncrypt, onUpload, onDone, onAbortable, onAbort, onReset },
  ] = useUploadStatus();

  const isUploading = useMemo(
    () => (!isEmpty(blobsUploadStatus) || isInProgress(blobsUploadStatus)),
    [blobsUploadStatus],
  );

  const { enqueueSnackbar } = useSnackbar();

  const handleClose = useCallback(
    () => {
      if (!isUploading) {
        return onClose();
      }
      return enqueueSnackbar(t('components:dialogUpload.progress'), { variant: 'warning', preventDuplicate: true });
    },
    [isUploading, onClose, enqueueSnackbar, t],
  );

  const handleUpload = useCallback(
    async (file, index) => {
      const onFileProgress = onProgress(index);

      onEncrypt(index);
      const encrypted = await onEncryptBuilder(file);
      onUpload(index);

      const { send, req } = onUploadBuilder(encrypted, onFileProgress);

      onAbortable(index, req);
      try {
        const response = await send();
        if (response.type === 'abort') {
          onAbort(index);
          throw new AbortError();
        }
        onDone(index);

        return isPlainObject(response) ? objectToCamelCase(response) : response;
      } catch (error) {
        if (isFunction(onError)) { onError(error); }
        throw error;
      }
    },
    [
      onAbortable, onAbort, onDone, onEncrypt, onEncryptBuilder,
      onError, onProgress, onUpload, onUploadBuilder,
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
              logSentryException(e, 'DialogUpload: fail to upload');
              return { ...rest, blob, error: true };
            }
          }),
      );

      const [successes, errors] = partition(newBlobList, errorPropNil);
      const aborts = newBlobList.filter(({ abort }) => abort === true);
      if (isEmpty(aborts)) {
        resetForm();
      } else {
        resetForm({ values: { [BLOBS_FIELD_NAME]: aborts } });
      }
      onReset();

      if (isEmpty(errors)) {
        if (isEmpty(aborts)) {
          onClose();
          if (isFunction(onSuccess)) {
            onSuccess(successes);
          }
        }
      } else {
        setStatus({ [BLOBS_FIELD_NAME]: newBlobList });
      }
    },
    [handleUpload, onClose, onSuccess, onReset],
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
        validationSchema={fileUploadValidationSchema}
        initialValues={initialValues}
        initialStatus={initialStatus}
        onSubmit={onSubmit}
      >
        {({ resetForm, values }) => (
          <Form>
            <DialogTitleWithClose
              title={t('components:dialogUpload.text', { count: values[BLOBS_FIELD_NAME].length })}
              onClose={getOnReset(resetForm)}
            >
              <BoxControls
                width={undefined}
                flexGrow={1}
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
                renderItem={(props) => <FieldBlobs {...props} />}
                fileTransform={fileTransform}
                uniqFn={uniqBlob}
                uploadStatus={blobsUploadStatus}
                autoFocus={autoFocus}
                disabled={!open}
              >
                <FormHelperText>
                  {t('components:dialogUpload.helperText')}
                &nbsp;
                  <Link
                    href={t('components:dialogUpload.helperLink')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('components:dialogUpload.helperLinkText')}
                  </Link>
                </FormHelperText>
              </FieldFiles>
            </DialogContent>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

UploadDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onUploadBuilder: PropTypes.func.isRequired,
  onEncryptBuilder: PropTypes.func.isRequired,
  onError: PropTypes.func,
  initialValues: PropTypes.object,
  initialStatus: PropTypes.object,
  fileTransform: PropTypes.func,
  autoFocus: PropTypes.bool,
};

UploadDialog.defaultProps = {
  open: false,
  initialValues: INITIAL_VALUES,
  initialStatus: INITIAL_STATUS,
  fileTransform: fileToBlob,
  autoFocus: false,
  onSuccess: null,
  onError: null,
};

export default UploadDialog;
