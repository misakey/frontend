import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';

import { addMultiBoxEvents } from 'store/reducers/box';
import BoxesSchema from 'store/schemas/Boxes';
import { removeEntities } from '@misakey/store/actions/entities';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { boxFileUploadValidationSchema } from 'constants/validationSchemas/boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
import log from '@misakey/helpers/log';
import uniqBy from '@misakey/helpers/uniqBy';
import partition from '@misakey/helpers/partition';
import promiseAllNoFailFast from '@misakey/helpers/promiseAllNoFailFast';
import { createBoxEncryptedFileBuilder } from '@misakey/helpers/builder/boxes';
import encryptFile from '@misakey/crypto/box/encryptFile';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import { makeStyles } from '@material-ui/core/styles/';
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

const fileToBlob = (file) => {
  const { name, lastModified, size, type } = file;

  return {
    blob: file,
    key: `${name}-${lastModified}-${size}-${type}`,
  };
};

const uniqBlob = (list) => uniqBy(list, 'key');

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
}) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();

  const { enqueueSnackbar } = useSnackbar();

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

        if (onSuccess) {
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
      const newBlobList = await promiseAllNoFailFast(
        blobs
          .map(async ({ blob, ...rest }) => {
            try {
              const response = await handleUpload(blob);
              return { ...response, ...rest, blob, isSent: true };
            } catch (e) {
              log(e, 'error');
              return { ...rest, blob };
            }
          }),
      );

      const [successes, errors] = partition(newBlobList, errorPropNil);

      dispatch(addMultiBoxEvents(boxId, successes));

      resetForm();

      if (isEmpty(errors)) {
        const text = t('boxes:read.upload.success');
        enqueueSnackbar(text, { variant: 'success' });
        onClose();
      } else {
        setStatus({ [BLOBS_FIELD_NAME]: newBlobList });
      }
    },
    [enqueueSnackbar, handleUpload, onClose, t, dispatch, boxId],
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
        validationSchema={boxFileUploadValidationSchema}
        initialValues={INITIAL_VALUES}
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
                fileTransform={fileToBlob}
                uniqFn={uniqBlob}
                emptyTitle={(
                  <DialogContentText
                    classes={{ root: classes.dialogContentTextRoot }}
                    id="upload-dialog-description"
                  >
                    {t('boxes:read.upload.dialog.text')}
                  </DialogContentText>
                )}
              />
              <FormHelperText>
                <Trans i18nKey={t('boxes:read.upload.dialog.helperText')}>
                  Déposer le fichier que vous souhaitez chiffrer.
                  {' '}
                  <Link
                    href={t('boxes:read.upload.dialog.helperLink')}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="secondary"
                  >
                    En savoir plus
                  </Link>
                </Trans>
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
  onSuccess: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {
  // request: null,
  open: false,
};

export default withTranslation(['common', 'boxes'])(UploadDialog);
