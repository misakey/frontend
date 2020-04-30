import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import DataboxSchema from 'store/schemas/Databox';

import { serviceRequestsReadValidationSchema } from 'constants/validationSchemas/dpo';

import log from '@misakey/helpers/log';
import prop from '@misakey/helpers/prop';
import last from '@misakey/helpers/last';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import { encryptBlobFile } from '@misakey/crypto/databox/crypto';

import { makeStyles } from '@material-ui/core/styles/';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import FieldFile from 'components/dumb/Form/Field/File';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from 'components/dumb/Form/Field/withErrors';
import BoxControls from 'components/dumb/Box/Controls';

const FIELD_NAME = 'blob';
const INITIAL_VALUES = { [FIELD_NAME]: null };

// HELPERS
function getFileExtension(fileName) {
  return `.${last(fileName.split('.'))}`;
}

// HOOKS
const useStyles = makeStyles((theme) => ({
  blob: {
    height: 'auto',
    padding: theme.spacing(3, 0),
  },
  mkAgentLink: {
    fontWeight: 'bold',
    color: 'inherit',
  },
}));

// @FIXME: refactor field file to properly integrate formik validation
let FieldBlob = ({
  className,
  displayError,
  errorKeys,
  setFieldValue,
  setFieldTouched,
  t,
  ...rest
}) => {
  const onChange = useCallback(
    (file) => {
      setFieldValue(FIELD_NAME, file);
      setFieldTouched(FIELD_NAME, true, false);
    },
    [setFieldValue, setFieldTouched],
  );

  return (
    <>
      <FieldFile
        accept={['*']}
        className={className}
        onChange={onChange}
        {...rest}
      />
      {displayError && (
        <FormHelperText error={displayError}>
          {t(errorKeys)}
        </FormHelperText>
      )}
    </>
  );
};

FieldBlob.propTypes = {
  className: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  t: PropTypes.func.isRequired,
};

FieldBlob = withTranslation('fields')(withErrors(FieldBlob));


function DpoRequestReadUploadDialog({
  request,
  t,
  onClose,
  onSuccess,
  open,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const { id, owner } = useMemo(() => request || {}, [request]);

  const { pubkeyData } = useMemo(
    () => owner || {},
    [owner],
  );

  const handleUpload = useCallback((form, { setFieldError, resetForm, setSubmitting }) => {
    const blob = form[FIELD_NAME];
    return encryptBlobFile(blob, pubkeyData)
      .then(({ ciphertext, nonce, ephemeralProducerPubKey }) => {
        const formData = new FormData();
        formData.append('transaction_id', Math.floor(Math.random() * 10000000000));
        formData.append('databox_id', id);
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
          .then((response) => {
            onSuccess(objectToCamelCaseDeep(response));
            const text = t('dpo:requests.read.upload.success', response);
            enqueueSnackbar(text, { variant: 'success' });
            resetForm({ values: INITIAL_VALUES });
            onClose();
          });
      })
      .catch((e) => {
        log(e);
        const details = prop('details')(e);
        if (details) {
          setFieldError(FIELD_NAME, 'invalid');
        } else {
          handleGenericHttpErrors(e);
        }
      })
      .finally(() => { setSubmitting(false); });
  }, [pubkeyData, id, onSuccess, t, enqueueSnackbar, onClose, handleGenericHttpErrors]);

  const getOnReset = useCallback(
    ({ resetForm }) => () => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="dpo-request-upload-dialog-title"
      aria-describedby="dpo-request-upload-dialog-description"
    >
      <DialogTitle>
        {t('dpo:requests.read.upload.dialog.title')}
      </DialogTitle>
      <Formik
        validationSchema={serviceRequestsReadValidationSchema}
        initialValues={INITIAL_VALUES}
        onSubmit={handleUpload}
      >
        {({
          values, dirty, setFieldValue, setFieldTouched, ...formikBag
        }) => (
          <Form>
            <DialogContent>
              <Field
                name={FIELD_NAME}
                component={FieldBlob}
                className={classes.blob}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
              />
            </DialogContent>
            <DialogActions>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:done'),
                }}
                secondary={{
                  onClick: getOnReset(formikBag),
                  text: t('common:cancel'),
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

DpoRequestReadUploadDialog.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes),
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

DpoRequestReadUploadDialog.defaultProps = {
  request: null,
  open: false,
};

export default withTranslation(['common', 'dpo'])(DpoRequestReadUploadDialog);
