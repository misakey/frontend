import React, { useMemo, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import isArray from '@misakey/helpers/isArray';
import resolveAny from '@misakey/helpers/resolveAny';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrag from '@misakey/hooks/useDrag';
import useMountEffect from '@misakey/hooks/useMountEffect';
import useCombinedRefs from '@misakey/hooks/useCombinedRefs';

// CONSTANTS
const ACTIVE_CLASS = 'active';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    border: `1px dashed ${theme.palette.primary.main}`,
    '&:active, &.active': {
      border: `1px solid ${theme.palette.primary.main}`,
    },
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

// COMPONENTS
const InputFileBase = forwardRef(({
  classes,
  accept, name,
  autoFocus,
  onChange,
  disabled,
  disableInputClick,
  labelAdornment,
  dragActiveLabelAdornment,
  dragInactiveAdornment,
  children,
  ...props
}, ref) => {
  const combinedRef = useCombinedRefs(ref);
  const [dragActive, dragEvents] = useDrag();

  const acceptString = useMemo(
    () => (isArray(accept) ? accept.join(', ') : ''),
    [accept],
  );

  const internalClasses = useStyles();

  const containerClassName = useMemo(
    () => (dragActive
      ? clsx(classes.container, internalClasses.container, ACTIVE_CLASS)
      : clsx(classes.container, internalClasses.container)),
    [classes.container, internalClasses.container, dragActive],
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

  const onInputClick = useCallback(
    (e) => {
      if (disableInputClick) {
        e.preventDefault();
      }
    },
    [disableInputClick],
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
      {dragActive ? dragActiveLabelAdornment || labelAdornment : labelAdornment}
      <label htmlFor={name}>
        <input
          id={name}
          type="file"
          name={name}
          accept={acceptString}
          ref={combinedRef}
          className={clsx(internalClasses.input, classes.input)}
          onChange={handleChange}
          onClick={onInputClick}
          disabled={disabled}
          {...props}
        />
        {!dragActive && dragInactiveAdornment}
      </label>
      {children}
    </div>
  );
});

InputFileBase.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
    input: PropTypes.string,
  }),
  accept: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  disableInputClick: PropTypes.bool,
  labelAdornment: PropTypes.node,
  dragActiveLabelAdornment: PropTypes.node,
  dragInactiveAdornment: PropTypes.node,
  children: PropTypes.node,
};

InputFileBase.defaultProps = {
  classes: {
    container: '',
    input: '',
  },
  accept: [],
  onChange: null,
  autoFocus: false,
  disabled: false,
  disableInputClick: false,
  labelAdornment: null,
  dragActiveLabelAdornment: null,
  dragInactiveAdornment: null,
  children: null,
};

export default InputFileBase;
