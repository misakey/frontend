import React, { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import isNaN from '@misakey/helpers/isNaN';
import trim from '@misakey/helpers/trim';
import isEmpty from '@misakey/helpers/isEmpty';
import repeat from '@misakey/helpers/repeat';

import makeStyles from '@material-ui/core/styles/makeStyles';

import TextField from '@material-ui/core/TextField';
import withErrors from '../withErrors';

// CONSTANTS
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
  inputInput: ({ length, variant }) => ({
    boxSizing: 'border-box',
    height: 'auto',
    // removes padding right, bottom padding to insert ::before element instead
    padding: theme.spacing(2, 0, 0, variant === STANDARD ? 0 : 1.5),
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
  inputRoot: ({ variant, content }) => ({
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
    paddingLeft: variant === STANDARD ? theme.spacing(0) : LETTER_SPACING,
    [theme.breakpoints.only('xs')]: {
      paddingLeft: variant === STANDARD ? theme.spacing(0) : XS_LETTER_SPACING,
    },
    '&::before': {
      position: 'static', // force behaviour when variant standard
      // borderBottom: 'none !important', // force behaviour when variant standard
      content: `'${content}'`,
      // arbitrary choice of typography
      ...theme.typography.h3,
      fontFamily: 'monospace',
      padding: variant === STANDARD ? theme.spacing(0) : theme.spacing(0, 1.5),
      letterSpacing: LETTER_SPACING,
      [theme.breakpoints.only('xs')]: {
        letterSpacing: XS_LETTER_SPACING,
      },
      // forcing lineHeight 0 for display purpose
      lineHeight: 0,
      // height comes from padding of outlined input
      height: LETTER_SIZE,
      // extra margin to make the text caret visible inside input even when full
      marginRight: variant === OUTLINED ? '0.25rem' : null,
    },
  }),
}));

// COMPONENTS
const FieldCode = forwardRef(({
  className, displayError, errorKeys, field, form: { setFieldValue, setFieldTouched },
  helperText, inputProps,
  variant,
  t, length,
  ...rest
}, ref) => {
  const isOutlined = useMemo(
    () => variant === OUTLINED,
    [variant],
  );

  const content = useMemo(
    () => repeatUnderline(length),
    [length],
  );
  const classes = useStyles({ length, content, variant });

  const { name } = field;

  const onChange = useCallback(
    (event) => {
      const { value } = event.target;
      // trim space characters
      const trimmedValue = trim(value);
      // keep only changes if number | empty text
      if (!isNaN(Number(trimmedValue)) || isEmpty(trimmedValue)) {
        setFieldValue(name, trimmedValue);
        setFieldTouched(name, true, false);
      }
    },
    [name, setFieldTouched, setFieldValue],
  );

  return (
    <TextField
      ref={ref}
      margin="normal"
      variant={variant}
      className={clsx(className)}
      inputProps={{
        type: 'text',
        maxLength: length,
        pattern: '[0-9]*',
        inputMode: 'numeric',
        autoComplete: 'off',
        'data-matomo-ignore': true,
        ...inputProps,
      }}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={{
        classes: {
          input: classes.inputInput,
          root: classes.inputRoot,
        },
        disableUnderline: !isOutlined,
        onChange,
      }}
      {...field}
      {...omit(rest, ['i18n', 'tReady', 'prefix'])}
      error={displayError}
      helperText={displayError ? t(errorKeys) : helperText}
    />
  );
});

FieldCode.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  helperText: PropTypes.string,
  length: PropTypes.number,
  inputProps: PropTypes.object,
  variant: PropTypes.oneOf([OUTLINED, STANDARD, 'filled']),
  t: PropTypes.func.isRequired,
};

FieldCode.defaultProps = {
  className: '',
  helperText: '',
  length: 6,
  inputProps: {},
  variant: STANDARD,
};

export default withTranslation('fields', { withRef: true })(withErrors(FieldCode));
