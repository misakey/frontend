import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import isFunction from '@misakey/helpers/isFunction';
import tDefault from '@misakey/helpers/tDefault';

import { makeStyles } from '@material-ui/core/styles';
import useFileReader from '@misakey/hooks/useFileReader';
import useDrag from '@misakey/hooks/useDrag';
import usePropChanged from '@misakey/hooks/usePropChanged';

import Button from '@material-ui/core/Button';
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

const useOnError = (setError) => useCallback((file) => (event) => {
  setError({ message: '', payload: { file, event } });
}, [setError]);

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

const useHandleChange = (file, preview, progress, onChange) => useEffect(() => {
  if (!isNil(file) && !isNil(preview) && isNil(progress) && isFunction(onChange)) {
    onChange(file, preview);
  }
}, [file, preview, progress, onChange]);

const useHandleError = (error, onError) => useEffect(() => {
  if (!isNil(error) && isFunction(onError)) {
    onError(error);
  }
}, [error, onError]);

const useHandleFieldValue = (valueChanged, value, file, onReset) => useEffect(
  () => {
    if (valueChanged && !isNil(file) && file !== value) {
      onReset();
    }
  },
  [valueChanged, value, file, onReset],
);

// COMPONENTS
const FileField = ({ className, t, onChange, onError, accept, field: { value } }) => {
  const [error, setError] = useState();
  const [dragActive, dragEvents] = useDrag();

  const classes = useStyles();

  const containerClassName = useClassNames(classes.container, className, dragActive);

  const inputRef = useRef();

  const onFileError = useOnError(setError);
  const [
    { file, preview, progress },
    { onChange: onFileChange, onReset },
  ] = useFileReader({ onError: onFileError });

  const onClick = useOnClick(inputRef);

  const acceptString = useAcceptString(accept);

  const valueChanged = usePropChanged(value);

  useHandleError(error, onError);
  useHandleChange(file, preview, progress, onChange);
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
          accept={acceptString}
          ref={inputRef}
          className={classes.input}
          onChange={onFileChange}
        />
        {!dragActive && (
          <Button
            variant="contained"
            color="secondary"
            type="button"
            aria-label={t('fields:file.button.choose.label', 'Choose a file')}
            onClick={onClick}
          >
            {t('fields:file.button.choose.label', 'Choose a file')}
          </Button>
        )}

      </label>
    </div>
  );
};

FileField.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  onChange: PropTypes.func,
  onError: PropTypes.func,
  field: PropTypes.shape({
    value: PropTypes.object,
  }),
  t: PropTypes.func,
};

FileField.defaultProps = {
  className: '',
  onChange: undefined,
  onError: undefined,
  accept: [],
  field: {},
  t: tDefault,
};

export default withTranslation(['common', 'fields'])(FileField);
