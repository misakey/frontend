import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';
import { withTranslation, Trans } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles/';

import FieldFile from 'components/dumb/Form/Field/File';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from 'components/dumb/Form/Field/withErrors';
import { TMP_BLOB_FIELD_NAME } from 'components/smart/Dialog/Boxes/Upload';
import { fileFieldValidation } from 'constants/fieldValidations';
import Link from '@material-ui/core/Link';


// HOOKS
const useStyles = makeStyles((theme) => ({
  blob: {
    height: '10rem',
    padding: theme.spacing(3, 0),
  },
}));


// @FIXME: refactor field file to properly integrate formik validation
const FieldBlobTmp = ({
  setNewBlob,
  displayError,
  errorKeys,
  field,
  t,
  ...rest
}) => {
  const { setFieldTouched, setFieldValue, setFieldError } = useFormikContext();
  const classes = useStyles();

  const onChange = useCallback(
    (e, { file }) => {
      // Validate only TmpBlobField because we don't want to display a `required`
      // error on `BlobsField` while component rerendering to push the new value
      // We use an intermediate state `newBlob` to be able to take advantage
      // of `FieldArray.push` method (Cf. ./BlobsField)
      setFieldValue(TMP_BLOB_FIELD_NAME, file, false);
      fileFieldValidation.blobSchema
        .validate(file)
        .then(() => {
          setNewBlob({ blob: file, id: new Date().getUTCMilliseconds() });
        })
        .catch((err) => {
          setFieldError(TMP_BLOB_FIELD_NAME, err.message);
          setFieldTouched(TMP_BLOB_FIELD_NAME, true, false);
        });
    },
    [setFieldError, setFieldTouched, setFieldValue, setNewBlob],
  );

  return (
    <>
      <FieldFile
        accept={['*']}
        className={classes.blob}
        labelText={t('boxes:read.upload.dialog.label')}
        field={{
          ...field,
          onChange,
        }}
        {...rest}
      />
      {displayError ? (
        <FormHelperText error>
          {t(errorKeys)}
        </FormHelperText>
      ) : (
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
      )}
    </>
  );
};

FieldBlobTmp.propTypes = {
  // Formik Field
  field: PropTypes.shape({
    value: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  setNewBlob: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes', 'dpo', 'fields'])(withErrors(FieldBlobTmp));
