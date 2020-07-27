import React, { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isArray from '@misakey/helpers/isArray';
import resolveAny from '@misakey/helpers/resolveAny';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrag from '@misakey/hooks/useDrag';
import useMountEffect from '@misakey/hooks/useMountEffect';
import useCombinedRefs from '@misakey/hooks/useCombinedRefs';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
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
  textError: {
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const InputFile = forwardRef(({
  accept, name,
  label, buttonText,
  autoFocus,
  onChange,
  ...props
}, ref) => {
  const combinedRef = useCombinedRefs(ref);
  const [dragActive, dragEvents] = useDrag();

  const acceptString = useMemo(
    () => (isArray(accept) ? accept.join(', ') : ''),
    [accept],
  );

  const classes = useStyles();

  const containerClassName = useMemo(
    () => (dragActive
      ? clsx(classes.container, ACTIVE_CLASS)
      : clsx(classes.container)),
    [classes.container, dragActive],
  );

  const onClear = useCallback(
    () => {
      const { current } = combinedRef;
      if (current) {
        // Fix for chrome https://stackoverflow.com/questions/9155136/chrome-file-upload-bug-on-change-event-wont-be-executed-twice-with-the-same-fi
        current.value = null;
      }
    },
    [combinedRef],
  );

  const handleChange = useCallback(
    (e) => {
      resolveAny(onChange(e)).then(onClear);
    },
    [onChange, onClear],
  );

  const onClick = useCallback((event) => {
    const { current } = combinedRef;
    if (current) {
      current.click(event);
    }
  }, [combinedRef]);

  useMountEffect(
    () => {
      if (autoFocus) {
        onClick();
      }
    },
  );

  return (
    <div className={containerClassName} {...dragEvents}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        p={3}
      >
        {label}
      </Box>
      <label htmlFor={name}>
        <input
          id={name}
          type="file"
          name={name}
          accept={acceptString}
          ref={combinedRef}
          className={classes.input}
          onChange={handleChange}
          {...props}
        />
        {!dragActive && (
        <Button
          standing={BUTTON_STANDINGS.TEXT}
          type="button"
          aria-label={buttonText}
          onClick={onClick}
          text={buttonText}
        />
        )}
      </label>
    </div>
  );
});

InputFile.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.node,
  buttonText: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
};

InputFile.defaultProps = {
  accept: [],
  onChange: null,
  label: null,
  autoFocus: false,
};

export default InputFile;
