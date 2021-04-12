import React, { useCallback, useEffect } from 'react';

import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import propOr from '@misakey/core/helpers/propOr';

import { makeStyles } from '@material-ui/core/styles';
import useFileReader from '@misakey/hooks/useFileReader';
import usePropChanged from '@misakey/hooks/usePropChanged';
import { useFormikContext } from 'formik';
import useModifier from '@misakey/hooks/useModifier';

import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import InputFile from '@misakey/ui/Input/File';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// HELPERS
const fieldDestrProp = propOr({}, 'field');

// HOOKS
const useStyles = makeStyles((theme) => ({
  progressBar: {
    width: '100%',
  },
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
}));

const useHandleFieldValue = (valueChanged, value, file, onReset) => useEffect(
  () => {
    // when value changed to nil but file didn't yet, call onReset
    if (valueChanged && isNil(value) && !isNil(file)) {
      onReset();
    }
  },
  [valueChanged, value, file, onReset],
);

// COMPONENTS
const FileField = ({
  t,
  onError,
  onUpload,
  accept,
  previewName,
  labelText,
  errorKeys,
  displayError,
  ...rest
}) => {
  const { value, name } = useModifier(fieldDestrProp, rest);

  const { setStatus, setFieldError, setFieldValue, setFieldTouched } = useFormikContext();

  const classes = useStyles();

  const onFileError = useCallback(
    (e) => {
      setFieldError(name, 'format');
      if (isFunction(onError)) {
        onError(e);
      }
    },
    [onError, name, setFieldError],
  );

  const onLoad = useCallback(
    ({ preview, file }) => {
      setFieldError(name, null);
      setFieldValue(name, file);
      setFieldTouched(name, true);
      setStatus({ [previewName]: preview });
      if (isFunction(onUpload)) {
        onUpload({ file, preview });
      }
    },
    [onUpload, previewName, name, setFieldError, setFieldValue, setFieldTouched, setStatus],
  );

  const [
    { file, progress },
    { onChange: onFileChange, onReset },
  ] = useFileReader({ onError: onFileError, onLoad });

  const [valueChanged] = usePropChanged(value, [file]);

  useHandleFieldValue(valueChanged, value, file, onReset);

  return (
    <>
      <InputFile
        accept={accept}
        name={name}
        onChange={onFileChange}
        disabled={!isNil(progress)}
        label={!isNil(progress) ? (
          <>
            <LinearProgress variant="determinate" value={progress} className={classes.progressBar} />
            <Typography variant="body1" color="textSecondary">
              {t('fields:file.loading', 'Import in progress')}
            </Typography>
          </>
        ) : (
          <>
            {file ? (
              <Typography variant="h6" color="textPrimary" noWrap>
                {file.name}
              </Typography>
            ) : (
              <Typography variant="h6" className={classes.label}>
                {labelText || t('fields:file.label', 'Drop a file here')}
              </Typography>

            )}
          </>
        )}
        buttonText={t('fields:files.button.choose.label', 'Choose a file')}
      />
      {displayError && (
        <FormHelperText error>
          {t(errorKeys)}
        </FormHelperText>
      )}
    </>
  );
};

FileField.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  onUpload: PropTypes.func,
  onError: PropTypes.func,
  previewName: PropTypes.string,
  labelText: PropTypes.string,
  // withErrors
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  // Formik Field
  field: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FileField.defaultProps = {
  onUpload: undefined,
  onError: undefined,
  accept: [],
  previewName: 'preview',
  labelText: null,
};

export default withTranslation(['fields'])(withErrors(FileField));
