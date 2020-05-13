import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';
import { withTranslation, Trans } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles/';

import FieldFile from 'components/dumb/Form/Field/File';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from 'components/dumb/Form/Field/withErrors';
import { TMP_BLOB_FIELD_NAME } from 'components/smart/Dialog/Upload';
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
  userEmail,
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
        labelText={t('dpo:requests.read.upload.dialog.label')}
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
          <Trans i18nKey={t('dpo:requests.read.upload.dialog.helperText')} values={{ userEmail }}>
            {'Déposer le fichier que vous souhaitez chiffrer pour'}
            {' '}
            {userEmail}
            {'. '}
            <Link href={t('dpo:requests.read.questions.href.0')} color="secondary">En savoir plus</Link>
          </Trans>
        </FormHelperText>
      )}
    </>
  );
};

FieldBlobTmp.propTypes = {
  userEmail: PropTypes.string.isRequired,
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

export default withTranslation(['dpo', 'fields'])(withErrors(FieldBlobTmp));
