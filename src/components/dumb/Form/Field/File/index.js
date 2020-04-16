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

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

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
  progress: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100 %',
    boxSizing: 'border-box',
    padding: '2rem',
  },
  progressBar: {
    width: '100%',
  },
  input: {
    opacity: '0',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: '0',
    top: '0',
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
  field: { value, onChange, name },
  form: { setStatus },
}) => {
  const [dragActive, dragEvents] = useDrag();

  const classes = useStyles();

  const containerClassName = useClassNames(classes.container, className, dragActive);

  const inputRef = useRef();

  const onFileError = useCallback(
    (e) => onError(e),
    [onError],
  );

  const onLoad = useCallback(
    (e, { preview }) => {
      onChange(e);
      setStatus({ [previewName]: preview });
      if (isFunction(onUpload)) {
        onUpload(e);
      }
    },
    [onChange, onUpload, previewName, setStatus],
  );

  const [
    { file, progress },
    { onChange: onFileChange, onReset },
  ] = useFileReader({ onError: onFileError, onLoad });

  const onClick = useOnClick(inputRef);

  const acceptString = useAcceptString(accept);

  const valueChanged = usePropChanged(value, [file]);

  useHandleFieldValue(valueChanged, value, file, onReset);

  return (
    <div className={containerClassName} {...dragEvents}>
      {file && (
        <Typography variant="h6" color="textPrimary">
          {file.name}
        </Typography>
      )}
      {!isNil(progress) && (
        <div className={classes.progress}>
          <LinearProgress variant="determinate" value={progress} className={classes.progressBar} />
          <Typography variant="body1" color="textSecondary">
            {t('fields:file.loading', 'Import in progress')}
          </Typography>
        </div>
      )}

      <Typography variant={dragActive ? 'h6' : 'body1'} color={dragActive ? 'secondary' : 'textPrimary'}>
        {t('fields:file.label', 'Drop a file here')}
      </Typography>

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
            standing={BUTTON_STANDINGS.MAIN}
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
  // Formik Field
  field: PropTypes.shape({
    value: PropTypes.object,
    name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    setStatus: PropTypes.func.isRequired,
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
};

export default withTranslation(['fields'])(FileField);
