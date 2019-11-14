import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import useTimeout from '@misakey/hooks/useTimeout';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from 'helpers/omit/translationProps';

import CancelIcon from '@material-ui/icons/Cancel';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

// CONSTANTS
const SEARCH_DELAY = 300;

// HOOKS
const useStyles = makeStyles((theme) => ({
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    [theme.breakpoints.only('xs')]: {
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle1.fontWeight,
      lineHeight: theme.typography.subtitle1.lineHeight,
      letterSpacing: theme.typography.subtitle1.letterSpacing,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      lineHeight: theme.typography.h6.lineHeight,
      letterSpacing: theme.typography.h6.letterSpacing,
    },
  },
  inputInput: {
    '&::-webkit-search-cancel-button': {
      display: 'none',
    },
  },
  inputNotchedOutline: {
    borderRadius: '200px',
  },
}));

const useOnSearchChange = (setInternalValue) => useCallback(
  ({ target: { value } }) => {
    setInternalValue(value);
  },
  [setInternalValue],
);

const useOnReset = (setInternalValue) => useCallback(
  () => {
    setInternalValue('');
  },
  [setInternalValue],
);

// COMPONENTS
function DialogSearchInput({
  onChange,
  delay,
  value,
  t,
  ...rest
}) {
  const classes = useStyles();

  const [internalValue, setInternalValue] = useState(value || '');

  const isSearchActive = useMemo(
    () => !isNil(value),
    [value],
  );

  const hasSearch = useMemo(
    () => !isEmpty(internalValue),
    [internalValue],
  );

  const onSearchChange = useOnSearchChange(setInternalValue);
  const onReset = useOnReset(setInternalValue);

  const immediateRun = useMemo(
    () => (isSearchActive && !hasSearch) // search is cleared but routeSearch was not empty
      || (!isSearchActive && !hasSearch), // search and routeSearch are empty
    [isSearchActive, hasSearch],
  );

  const onChangeCb = useCallback(
    () => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    },
    [onChange, internalValue, value],
  );

  useTimeout(
    onChangeCb,
    { delay, immediateRun },
    internalValue,
    hasSearch,
    isSearchActive,
  );

  return (
    <TextField
      id="dialog-search"
      type="search"
      fullWidth
      variant="outlined"
      inputProps={{
        autoComplete: 'off',
      }}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      InputProps={{
        classes: {
          root: classes.inputRoot,
          input: classes.inputInput,
          notchedOutline: classes.inputNotchedOutline,
        },
        notched: false,
        // disableUnderline: true,
        endAdornment: (
          <>
            {hasSearch && (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t('nav:search.button.clear')}
                  type="reset"
                  onClick={onReset}
                >
                  <CancelIcon />
                </IconButton>
              </InputAdornment>
            )}
            <InputAdornment position="end">
              <IconButton aria-label={t('nav:search.button.search')} onClick={onChangeCb} type="button">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          </>
        ),
      }}
      value={internalValue}
      onChange={onSearchChange}
      {...omitTranslationProps(rest)}
    />
  );
}

DialogSearchInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  delay: PropTypes.number,
  value: PropTypes.string,
  t: PropTypes.func.isRequired,
};

DialogSearchInput.defaultProps = {
  delay: SEARCH_DELAY,
  value: '',
};


export default withTranslation('nav')(DialogSearchInput);
