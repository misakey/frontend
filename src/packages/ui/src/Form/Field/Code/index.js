import React, { useMemo, useCallback, useEffect, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import isNaN from '@misakey/helpers/isNaN';
import trim from '@misakey/helpers/trim';
import isEmpty from '@misakey/helpers/isEmpty';
import repeat from '@misakey/helpers/repeat';
import mergeDeepLeft from '@misakey/helpers/mergeDeepLeft';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFormikContext } from 'formik';

import TextField from '@material-ui/core/TextField';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// CONSTANTS
const PRIMARY = 'primary';
const SECONDARY = 'secondary';

const OUTLINED = 'outlined';
const STANDARD = 'standard';

// copied padding of outlined input
const LETTER_SPACING = '2rem';
const LETTER_SIZE = '1ch';

const XS_LETTER_SPACING = '1.5rem';

const UNDERLINE_CHAR = '_';

// HELPERS
const repeatUnderline = (length) => repeat(UNDERLINE_CHAR, length);

// HOOKS
const useStyles = makeStyles((theme) => ({
  inputInput: ({ length }) => ({
    boxSizing: 'border-box',
    height: 'auto',
    // removes padding right, bottom padding to insert ::before element instead
    paddingRight: 0,
    paddingBottom: 0,
    // arbitrary choice of typography
    ...theme.typography.h3,
    // @FIXME use a more fancy font? We simply need a monospaced font
    // Roboto Mono has issues with monospace
    fontFamily: 'monospace',
    letterSpacing: LETTER_SPACING,
    width: `calc(${length} * (${LETTER_SIZE} + ${LETTER_SPACING}) + ${LETTER_SIZE})`,
    [theme.breakpoints.only('xs')]: {
      letterSpacing: XS_LETTER_SPACING,
      width: `calc(${length} * (${LETTER_SIZE} + ${XS_LETTER_SPACING}) + ${LETTER_SIZE})`,
    },
  }),
  inputRoot: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: ({ centered }) => (centered ? 'center' : 'flex-start'),
    paddingLeft: ({ variant }) => (variant === STANDARD ? theme.spacing(0) : LETTER_SPACING),
    [theme.breakpoints.only('xs')]: {
      paddingLeft: ({ variant }) => (variant === STANDARD ? theme.spacing(0) : XS_LETTER_SPACING),
    },
    '&::before': {
      position: 'static', // force behaviour when variant standard
      // borderBottom: 'none !important', // force behaviour when variant standard
      content: ({ content }) => `'${content}'`,
      // arbitrary choice of typography
      ...theme.typography.h3,
      fontFamily: 'monospace',
      padding: ({ variant }) => (variant === STANDARD ? theme.spacing(0) : theme.spacing(0, 1.5)),
      letterSpacing: LETTER_SPACING,
      [theme.breakpoints.only('xs')]: {
        letterSpacing: XS_LETTER_SPACING,
      },
      // forcing lineHeight 0.1 for display purpose
      lineHeight: 0.1,
      // height comes from padding of outlined input
      height: LETTER_SIZE,
      // extra margin to make the text caret visible inside input even when full
      marginRight: ({ variant }) => (variant === OUTLINED ? '0.25rem' : null),
      color: 'inherit',
    },
  },
  inputFocused: {
    '&::before': {
      color: ({ color }) => (color === SECONDARY
        ? theme.palette.secondary.main
        : theme.palette.primary.main),
    },
  },
}));

// COMPONENTS
const FieldCode = forwardRef(({
  className, displayError, errorKeys, field, form: { setFieldValue, setFieldTouched },
  helperText, inputProps, InputProps,
  variant, color, centered,
  t, length,
  ...rest
}, ref) => {
  const { initialValues } = useFormikContext();

  const isOutlined = useMemo(
    () => variant === OUTLINED,
    [variant],
  );

  const content = useMemo(
    () => repeatUnderline(length),
    [length],
  );
  const classes = useStyles({ length, content, variant, color, centered });

  const { name, value } = field;

  const initialValue = useMemo(
    () => initialValues[name],
    [initialValues, name],
  );

  const onChange = useCallback(
    (event) => {
      const { value: nextValue } = event.target;
      // trim space characters
      const trimmedValue = trim(nextValue);
      // keep only changes if number | empty text
      if (!isNaN(Number(trimmedValue)) || isEmpty(trimmedValue)) {
        setFieldValue(name, trimmedValue);
        setFieldTouched(name, true, false);
      }
    },
    [name, setFieldTouched, setFieldValue],
  );

  const codeInputProps = useMemo(
    () => mergeDeepLeft({
      classes: {
        input: classes.inputInput,
        root: classes.inputRoot,
        focused: classes.inputFocused,
      },
      disableUnderline: !isOutlined,
      onChange,
    }, InputProps),
    [classes, isOutlined, onChange, InputProps],
  );

  // cleanup wrong values coming down from formik
  useEffect(
    () => {
      const trimmedValue = trim(value);
      if (!isEmpty(trimmedValue) && isNaN(Number(trimmedValue))) {
        setFieldValue(name, initialValue);
        setFieldTouched(name, true, false);
      }
    },
    [value, setFieldValue, setFieldTouched, name, initialValue],
  );

  return (
    <TextField
      ref={ref}
      margin="normal"
      variant={variant}
      color={color}
      className={className}
      inputProps={{
        type: 'text',
        maxLength: length,
        pattern: '[0-9]*',
        inputMode: 'numeric',
        autoComplete: 'off',
        'data-matomo-ignore': true,
        ...inputProps,
      }}
      {...omit(rest, ['i18n', 'tReady', 'prefix'])}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={codeInputProps}
      {...field}
      error={displayError}
      helperText={displayError ? t(errorKeys) : helperText}
    />
  );
});

FieldCode.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  helperText: PropTypes.string,
  length: PropTypes.number,
  inputProps: PropTypes.object,
  InputProps: PropTypes.object,
  color: PropTypes.oneOf([PRIMARY, SECONDARY]),
  variant: PropTypes.oneOf([OUTLINED, STANDARD, 'filled']),
  centered: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

FieldCode.defaultProps = {
  className: '',
  helperText: '',
  length: 6,
  inputProps: {},
  InputProps: {},
  color: PRIMARY,
  variant: STANDARD,
  centered: false,
};

export default withTranslation('fields', { withRef: true })(withErrors(FieldCode));
