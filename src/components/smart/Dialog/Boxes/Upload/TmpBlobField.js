import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { makeStyles } from '@material-ui/core/styles/';
import useFieldErrors from '@misakey/hooks/useFieldErrors';

import FieldFile from 'components/dumb/Form/Field/File';
import FormHelperText from '@material-ui/core/FormHelperText';
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
  name,
  prefix,
  t,
  ...rest
}) => {
  const classes = useStyles();

  const fieldConfig = useMemo(
    () => ({ name, prefix }),
    [name, prefix],
  );

  const {
    field,
    helpers: { setTouched, setError },
    errorKeys,
    displayError,
  } = useFieldErrors(fieldConfig);

  const onUpload = useCallback(
    (e, { file }) => {
      // Validate only TmpBlobField because we don't want to display a `required`
      // error on `BlobsField` while component rerendering to push the new value
      // We use an intermediate state `newBlob` to be able to take advantage
      fileFieldValidation.blobSchema
        .validate(file)
        .then(() => {
          setNewBlob({ blob: file, id: new Date().getUTCMilliseconds() });
        })
        .catch((err) => {
          setError(err.message);
          setTouched(true, false);
        });
    },
    [setNewBlob, setError, setTouched],
  );

  return (
    <>
      <FieldFile
        name={name}
        accept={['*']}
        className={classes.blob}
        labelText={t('boxes:read.upload.dialog.label')}
        field={field}
        onUpload={onUpload}
        {...omitTranslationProps(rest)}
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
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  setNewBlob: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FieldBlobTmp.defaultProps = {
  prefix: '',
};

export default withTranslation(['boxes', 'dpo', 'fields'])(FieldBlobTmp);
