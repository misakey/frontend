import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as Yup from 'yup';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';
import isArray from '@misakey/helpers/isArray';

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

const { invalid } = errorTypes;
export const getValidationSchema = (length = 6) => Yup.string()
  .matches(new RegExp(`/^[0-9]{${length}}$/`), { message: invalid });

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: 'none',
  },
  input: {
    marginRight: theme.spacing(0.5),
    width: INPUT_WIDTH,
    height: INPUT_WIDTH * 1.25,
    '&:nth-child(3)': {
      marginRight: theme.spacing(2),
    },
  },
  inputProps: {
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

const DEFAULT_NAME = 'code';

const FieldCode = ({
  autoFocus, className, displayError, errorKeys, field, form,
  hidden, helperText, helperTextProps, label, labelProps, length, reset, t, ...rest
}) => {
  const classes = useStyles();
  const { name = DEFAULT_NAME, value } = field;
  const { values, setFieldValue } = form;

  const defaultLabel = React.useMemo(() => t(`fields:${name}.label`), [t, name]);
  const helperTextOrTranslation = React.useMemo(() => (
    helperText || t(`fields:${name}.helperText`, { count: length || 0 })),
  [helperText, t, name, length]);

  const inputs = React.useMemo(() => {
    const response = [];
    for (let i = 0; i < length; i += 1) { response.push(`${name}-${i}`); }

    return response;
  }, [name, length]);

  // Sounds good, doesn't work
  // const inputRefs = React.useRef(inputs.map(React.createRef));

  const inputRefs = [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  for (let i = 0; i < length; i += 1) { inputRefs.push(React.useRef()); }

  const handleChange = React.useCallback((e, inputIndex) => {
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

    setFieldValue(name, newValues);
  }, [inputRefs, length, name, setFieldValue, values]);

  const handleReset = React.useCallback(() => {
    setFieldValue(name, inputs.map(() => ''));
    inputRefs[0].current.focus();
  }, [inputRefs, inputs, name, setFieldValue]);

  const handleKeyPress = React.useCallback((e, i) => {
    const blackList = ['e', 'E', '.', ',', '-', '+'];
    const targetValue = e.target.value;
    const newValues = [...values[name]];

    if (blackList.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'Backspace' && targetValue === '') {
      newValues[i - 1] = '';
      setFieldValue(name, newValues);

      const prevRef = inputRefs[i - 1];
      if (prevRef) { prevRef.current.focus(); }
    }

    if (e.key === 'Delete' && i + 1 < length && !isEmpty(newValues[i + 1])) {
      newValues[i + 1] = '';
      setFieldValue(name, newValues);

      const nextRef = inputRefs[i + 1];
      if (nextRef) { nextRef.current.focus(); }
    }
  }, [inputRefs, length, name, setFieldValue, values]);

  const errorOrHelperText = React.useMemo(
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
              autoFocus={autoFocus && i === 0}
              className={clsx(classes.input, className)}
              error={displayError}
              id={n}
              inputRef={inputRefs[i]}
              inputProps={{ className: classes.inputProps, min: 0, max: 9 }}
              labelWidth={(label === undefined && i === 0) ? LABEL_WIDTH : undefined}
              name={n}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyPress(e, i)}
              value={values[name][i]}
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
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
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
  autoFocus: false,
  className: '',
  helperText: '',
  helperTextProps: {},
  hidden: false,
  label: undefined,
  labelProps: {},
  length: 6,
  reset: false,
};

export default withTranslation('fields')(withErrors(FieldCode));
