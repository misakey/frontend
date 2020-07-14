import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import isFunction from '@misakey/helpers/isFunction';

import { makeStyles } from '@material-ui/core/styles';
import useFileReader from '@misakey/hooks/useFileReader';
import useDrag from '@misakey/hooks/useDrag';
import usePropChanged from '@misakey/hooks/usePropChanged';
import { useFormikContext } from 'formik';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Box from '@material-ui/core/Box';

// CONSTANTS
const ACTIVE_CLASS = 'active';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20rem',
    border: `1px dashed ${theme.palette.primary.main}`,
    position: 'relative',
    '&:active, &.active': {
      border: `1px solid ${theme.palette.secondary.main}`,
    },
  },
  progressBar: {
    width: '100%',
  },
  input: {
    cursor: 'pointer',
    opacity: '0',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: '0',
    top: '0',
  },
  label: {
    color: theme.palette.grey[300],
    textTransform: 'uppercase',
    textAlign: 'center',
  },
}));

const useClassNames = (defaultClass, className, dragActive) => useMemo(
  () => (dragActive
    ? clsx(defaultClass, className, ACTIVE_CLASS)
    : clsx(defaultClass, className)),
  [defaultClass, className, dragActive],
);

const useOnClick = (inputRef) => useCallback((event) => {
  const { current } = inputRef;
  if (current) {
    current.click(event);
  }
}, [inputRef]);

const useAcceptString = (accept) => useMemo(
  () => (isArray(accept) ? accept.join(', ') : ''),
  [accept],
);

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
  className,
  t,
  onError,
  onUpload,
  accept,
  previewName,
  labelText,
  field: { value, name },
}) => {
  const [dragActive, dragEvents] = useDrag();
  const { setStatus, setFieldError, setFieldValue, setFieldTouched } = useFormikContext();

  const classes = useStyles();

  const containerClassName = useClassNames(classes.container, className, dragActive);

  const inputRef = useRef();

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
  ] = useFileReader({ onError: onFileError, onLoad, inputRef });

  const onClick = useOnClick(inputRef);

  const acceptString = useAcceptString(accept);

  const [valueChanged] = usePropChanged(value, [file]);

  useHandleFieldValue(valueChanged, value, file, onReset);

  return (
    <div className={containerClassName} {...dragEvents}>
      {file && (
        <Typography variant="h6" color="textPrimary" noWrap>
          {file.name}
        </Typography>
      )}
      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        p={3}
      >
        {!isNil(progress) ? (
          <>
            <LinearProgress variant="determinate" value={progress} className={classes.progressBar} />
            <Typography variant="body1" color="textSecondary">
              {t('fields:file.loading', 'Import in progress')}
            </Typography>
          </>
        ) : (
          <Typography variant="h5" className={classes.label}>
            {labelText || t('fields:file.label', 'Drop a file here')}
          </Typography>
        )}
      </Box>

      <label htmlFor="button-file">
        <input
          id="button-file"
          type="file"
          name={name}
          accept={acceptString}
          ref={inputRef}
          className={classes.input}
          onChange={onFileChange}
        />
        {!dragActive && (
          <Button
            standing={BUTTON_STANDINGS.TEXT}
            type="button"
            aria-label={t('fields:file.button.choose.label', 'Choose a file')}
            onClick={onClick}
            text={t('fields:file.button.choose.label', 'Choose a file')}
          />
        )}

      </label>
    </div>
  );
};

FileField.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
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
  className: '',
  onUpload: undefined,
  onError: undefined,
  accept: [],
  previewName: 'preview',
  labelText: null,
};

export default withTranslation(['fields'])(FileField);
