import React, { useCallback, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import { makeStyles } from '@material-ui/core/styles';
import useFileReader from '@misakey/hooks/useFileReader';
import usePropChanged from '@misakey/hooks/usePropChanged';
import { useFormikContext } from 'formik';

import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import InputFile from '@misakey/ui/Input/File';

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
  field: { value, name },
}) => {
  const { setStatus, setFieldError, setFieldValue, setFieldTouched } = useFormikContext();

  const classes = useStyles();

  const onFileError = useCallback(
    (e) => onError(e),
    [onError],
  );

  const onLoad = useCallback(
    (e, { preview, file }) => {
      setFieldError(name, null);
      setFieldValue(name, file);
      setFieldTouched(name, true);
      setStatus({ [previewName]: preview });
      if (isFunction(onUpload)) {
        onUpload(e, { file, preview });
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
    <InputFile
      accept={accept}
      name={name}
      onChange={onFileChange}
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
            <Typography variant="h5" className={classes.label}>
              {labelText || t('fields:file.label', 'Drop a file here')}
            </Typography>

          )}
        </>
      )}

      buttonText={t('fields:files.button.choose.label', 'Choose a file')}
    />
  );
};

FileField.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  onUpload: PropTypes.func,
  onError: PropTypes.func,
  previewName: PropTypes.string,
  labelText: PropTypes.string,
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

export default withTranslation(['fields'])(FileField);
