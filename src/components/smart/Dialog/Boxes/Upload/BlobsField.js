
import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';
import { withTranslation } from 'react-i18next';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import groupBy from '@misakey/helpers/groupBy';

import { makeStyles } from '@material-ui/core/styles/';
import DialogContentText from '@material-ui/core/DialogContentText';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';

import BoxMessage from '@misakey/ui/Box/Message';
import BlobListItem from 'components/dumb/ListItem/Blob';
import FormHelperText from '@material-ui/core/FormHelperText';

import { TMP_BLOB_FIELD_NAME, BLOBS_FIELD_NAME, INITIAL_VALUES } from 'components/smart/Dialog/Boxes/Upload';

// HOOKS
const useStyles = makeStyles(() => ({
  dialogContentTextRoot: {
    textAlign: 'center',
  },
  textError: {
    whiteSpace: 'pre-wrap',
  },
}));

const getFilenamesStatuses = (status) => {
  if (isNil(status)) { return {}; }
  const { errors = [], sent = [] } = groupBy(status, ({ isSent }) => (isSent ? 'sent' : 'errors'));
  return {
    filenamesErrors: errors.map(({ blob }) => `\n - ${blob.name}`),
    filenamesSent: sent.map(({ blob }) => `\n - ${blob.name}`),
  };
};

const FieldBlobs = ({ push, remove, newBlob, setNewBlob, t }) => {
  const { setFieldValue, values, errors, status, isValidating } = useFormikContext();
  const classes = useStyles();

  const fieldError = useMemo(() => errors[BLOBS_FIELD_NAME], [errors]);
  const fieldValue = useMemo(() => values[BLOBS_FIELD_NAME], [values]);
  const fieldStatus = useMemo(() => status[BLOBS_FIELD_NAME], [status]);

  const { filenamesErrors, filenamesSent } = useMemo(
    () => getFilenamesStatuses(fieldStatus),
    [fieldStatus],
  );

  const displayError = useMemo(
    () => !isNil(fieldError) && !isValidating, [fieldError, isValidating],
  );

  useEffect(
    () => {
      if (!isNil(newBlob)) {
        setFieldValue(TMP_BLOB_FIELD_NAME, INITIAL_VALUES[TMP_BLOB_FIELD_NAME], false);
        push(newBlob);
        setNewBlob(null);
      }
    },
    [newBlob, push, setFieldValue, setNewBlob],
  );

  return (
    <List>
      {isEmpty(fieldValue) && (
        <DialogContentText
          classes={{ root: classes.dialogContentTextRoot }}
          id="upload-dialog-description"
        >
          {t('boxes:read.upload.dialog.text')}
        </DialogContentText>
      )}
      {fieldValue.map(
        ({ id, blob, isSent }, index) => (
          <BlobListItem
            key={`blob-${id}`}
            blob={blob}
            isEncrypted={isSent}
            onRemove={() => remove(index)}
          />
        ),
      )}
      {!isNil(fieldStatus) && (
        <BoxMessage type="error" p={2} className={classes.textError}>
          <Typography>
            {t('boxes:read.upload.dialog.errors.blobs.api.notSent', { filenamesErrors })}
            {!isEmpty(filenamesSent) && (
              t('boxes:read.upload.dialog.errors.blobs.api.sent', { filenamesSent })
            )}
          </Typography>

        </BoxMessage>
      )}
      {displayError && (
        <FormHelperText error className={classes.textError}>
          {t(`boxes:read.upload.dialog.errors.blobs.${fieldError}`)}
        </FormHelperText>
      )}
    </List>
  );
};

FieldBlobs.propTypes = {
  // Formik FieldArray
  push: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  newBlob: PropTypes.object,
  setNewBlob: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

FieldBlobs.defaultProps = {
  newBlob: null,
};

export default withTranslation('boxes')(FieldBlobs);
