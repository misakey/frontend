import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import isFunction from '@misakey/helpers/isFunction';
import identity from '@misakey/helpers/identity';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';

import errorTypes from 'constants/errorTypes';
import withErrors from '../withErrors';

const LABEL_WIDTH = 39;
const INPUT_WIDTH = 56;
const XS_INPUT_WIDTH = 40;

const { invalid } = errorTypes;
export const getValidationSchema = (length = 6) => Yup.string()
  .matches(new RegExp(`/^[0-9]{${length}}$/`), { message: invalid });

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: 'none',
  },
  inputRoot: {
    marginRight: theme.spacing(0.5),
    width: INPUT_WIDTH,
    height: INPUT_WIDTH * 1.25,
    [theme.breakpoints.only('xs')]: {
      width: XS_INPUT_WIDTH,
      height: XS_INPUT_WIDTH * 1.25,
    },
    '&:nth-child(3)': {
      marginRight: theme.spacing(2),
    },
  },
  inputInput: {
    textAlign: 'center',
    '-webkit-appearance': 'textfield',
    '-moz-appearance': 'textfield',
    appearance: 'textfield',
    '&::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
    },
    '&::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
    },
  },
  formControl: {
    '& .MuiInputLabel-root[data-shrink=false]': {
      fontSize: '0.75rem',
      paddingTop: '9px',
    },
  },
  formLabel: {
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
  },
}));

const DEFAULT_NAME = 'confirmationCode';

const FieldCode = ({
  formatFieldValue,
  autoFocus, displayError, errorKeys, field, form: { values, setFieldValue, setFieldTouched },
  hidden, helperText, helperTextProps, label, labelProps, length, reset, t, ...rest
}) => {
  const classes = useStyles();
  const { name = DEFAULT_NAME, value } = field;

  const defaultLabel = useMemo(() => t(`fields:${name}.label`), [t, name]);
  // @FIXME: use length of code in helperText (doesn't work with _plural and count)
  const helperTextOrTranslation = useMemo(() => (
    isNil(helperText) ? t(`fields:${name}.helperText`) : helperText),
  [helperText, t, name]);

  const inputs = useMemo(() => {
    const response = [];
    for (let i = 0; i < length; i += 1) { response.push(`${name}-${i}`); }

    return response;
  }, [name, length]);

  // Sounds good, doesn't work
  // const inputRefs = React.useRef(inputs.map(React.createRef));

  const inputRefs = [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  for (let i = 0; i < length; i += 1) { inputRefs.push(useRef()); }

  const formatValues = useMemo(
    () => (isFunction(formatFieldValue) ? formatFieldValue : identity),
    [formatFieldValue],
  );

  const updateValue = useCallback(
    (newValue) => {
      setFieldValue(name, formatValues(newValue));
      if (newValue.length === length) {
        setFieldTouched(name, true, false);
      }
    },
    [setFieldValue, name, formatValues, length, setFieldTouched],
  );

  const handleChange = useCallback((e, inputIndex) => {
    const targetValue = e.target.value;

    const newValues = [...values[name]];

    for (
      let valuePositionIndex = 0;
      valuePositionIndex < length - inputIndex;
      valuePositionIndex += 1
    ) {
      const number = targetValue[valuePositionIndex];
      const isNumberRegex = /[0-9]/g;

      if (number && number.match(isNumberRegex)) {
        if (valuePositionIndex === 0 || isEmpty(newValues[inputIndex + valuePositionIndex])) {
          newValues[inputIndex + valuePositionIndex] = number;
          const nextRef = inputRefs[inputIndex + valuePositionIndex + 1];
          if (nextRef) { nextRef.current.focus(); }
        }
      } else if (number === undefined && valuePositionIndex === 0) {
        newValues[inputIndex] = '';
        const prevRef = inputRefs[inputIndex - 1];
        if (prevRef) { prevRef.current.focus(); }
      }
    }

    updateValue(newValues);
  }, [inputRefs, length, name, updateValue, values]);

  const handleReset = useCallback(() => {
    updateValue(inputs.map(() => ''));
    inputRefs[0].current.focus();
  }, [inputRefs, inputs, updateValue]);

  const handleKeyPress = useCallback((e, i) => {
    const blackList = ['e', 'E', '.', ',', '-', '+'];
    const targetValue = e.target.value;
    const newValues = [...values[name]];

    if (blackList.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'Backspace' && targetValue === '') {
      newValues[i - 1] = '';
      updateValue(newValues);

      const prevRef = inputRefs[i - 1];
      if (prevRef) { prevRef.current.focus(); }
    }

    if (e.key === 'Delete' && i + 1 < length && !isEmpty(newValues[i + 1])) {
      newValues[i + 1] = '';
      updateValue(newValues);

      const nextRef = inputRefs[i + 1];
      if (nextRef) { nextRef.current.focus(); }
    }
  }, [inputRefs, length, name, updateValue, values]);

  const errorOrHelperText = useMemo(
    () => (displayError ? t(errorKeys) : helperTextOrTranslation),
    [displayError, t, errorKeys, helperTextOrTranslation],
  );

  return (
    <>
      <TextField
        {...field}
        name={name}
        className={classes.hidden}
        value={isArray(value) ? value.join('') : value}
      />
      <FormControl
        error={displayError}
        margin="normal"
        variant="outlined"
        className={clsx(classes.formControl, classes.root)}
      >
        {label && (
          <FormLabel
            error={displayError}
            {...labelProps}
            htmlFor={`${name}-0`}
            className={clsx(classes.formLabel, labelProps.className)}
          >
            {label}
          </FormLabel>
        )}
        {label === undefined && (
          <InputLabel
            error={displayError}
            variant="outlined"
            {...labelProps}
            htmlFor={`${name}-0`}
            className={clsx(classes.label, labelProps.className)}
          >
            {defaultLabel}
          </InputLabel>
        )}
        <Box display="flex" flexDirection="row" alignItems="center">
          {inputs.map((n, i) => (
            <OutlinedInput
              key={n}
              autoFocus={autoFocus && i === 0}
              classes={{ root: classes.inputRoot, input: classes.inputInput }}
              error={displayError}
              id={n}
              inputRef={inputRefs[i]}
              inputProps={{ min: 0, max: 9 }}
              labelWidth={(label === undefined && i === 0) ? LABEL_WIDTH : undefined}
              name={n}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyPress(e, i)}
              value={values[name][i] || ''}
              {...omit(rest, ['i18n', 'tReady', 'form', 'helperText'])}
            />
          ))}
          {reset && (
            <IconButton aria-label="reset" onClick={handleReset}>
              <ClearIcon />
            </IconButton>
          )}
        </Box>
        {errorOrHelperText && (
          <FormHelperText
            error={displayError}
            variant="outlined"
            {...helperTextProps}
            className={clsx(classes.helperText, helperTextProps.className)}
          >
            {errorOrHelperText}
          </FormHelperText>
        )}
      </FormControl>
    </>
  );
};

FieldCode.propTypes = {
  formatFieldValue: PropTypes.func,
  autoFocus: PropTypes.bool,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func.isRequired,
    values: PropTypes.object.isRequired,
  }).isRequired,
  helperText: PropTypes.string,
  helperTextProps: PropTypes.object,
  hidden: PropTypes.bool,
  label: PropTypes.string,
  labelProps: PropTypes.object,
  length: PropTypes.number,
  reset: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

FieldCode.defaultProps = {
  formatFieldValue: null,
  autoFocus: false,
  helperText: null,
  helperTextProps: {},
  hidden: false,
  label: undefined,
  labelProps: {},
  length: 6,
  reset: false,
};

export default withTranslation('fields')(withErrors(FieldCode));
