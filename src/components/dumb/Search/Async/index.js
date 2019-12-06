import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import omit from '@misakey/helpers/omit';
import isString from '@misakey/helpers/isString';
import debounce from '@misakey/helpers/debounce';
import isFunction from '@misakey/helpers/isFunction';
import propOr from '@misakey/helpers/propOr';

import { makeStyles } from '@material-ui/core';

import Autocomplete from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

import 'components/dumb/Search/Async/Async.scss';

// CONSTANTS
export const SEARCH_MIN_CHAR = 1;

// HELPERS
const optionMainDomainOrEmpty = propOr('', 'mainDomain');

// HOOKS
const useStyles = makeStyles((theme) => ({
  icon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    flexWrap: 'nowrap',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
  },
}));

function SearchAsync({
  autoFocus, initialValue, onAutocomplete, onChange,
  onGetOptions, placeholder, t, ...rest
}) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(isString(initialValue) ? initialValue : '');
  const [options, setOptions] = useState([]);

  const handleChange = useCallback((event) => {
    setInputValue(event.target.value);
    if (isFunction(onChange)) { onChange(event.target.value); }
  }, [onChange]);

  const handleGetOptions = useMemo(
    () => debounce((value, setOptionsIfActive) => {
      onGetOptions(value, setOptionsIfActive, setLoading, setInputValue);
    }, 200),
    [onGetOptions],
  );

  const getOptionLabel = useCallback((option) => optionMainDomainOrEmpty(option), []);

  useEffect(() => {
    let active = true;

    if (inputValue === '' || inputValue.length < SEARCH_MIN_CHAR) {
      setOptions([]);
      return undefined;
    }

    handleGetOptions(inputValue, (result) => {
      if (active) { setOptions(result); }
    });

    return () => {
      active = false;
    };
  }, [handleGetOptions, inputValue]);

  return (
    <Autocomplete
      options={options}
      onChange={onAutocomplete}
      getOptionLabel={getOptionLabel}
      renderInput={({ InputProps, inputProps, ref }) => (
        <>
          <div className={classes.icon}>
            {loading ? <CircularProgress color="inherit" size={20} /> : <SearchIcon />}
          </div>
          <InputBase
            {...InputProps}
            ref={ref}
            autoFocus={autoFocus}
            onChange={handleChange}
            endAdornment={<Box mr={1}>{InputProps.endAdornment}</Box>}
            inputProps={inputProps}
            placeholder={placeholder || t('search')}
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
          />
        </>
      )}
      {...omit(rest, ['i18n', 'tReady', 'staticContext'])}
    />
  );
}

SearchAsync.propTypes = {
  autoFocus: PropTypes.bool,
  initialValue: PropTypes.string,
  onAutocomplete: PropTypes.func,
  onChange: PropTypes.func,
  onGetOptions: PropTypes.func,
  placeholder: PropTypes.string,
  t: PropTypes.func.isRequired,
};

SearchAsync.defaultProps = {
  autoFocus: false,
  initialValue: '',
  onAutocomplete: undefined,
  onChange: undefined,
  onGetOptions: undefined,
  placeholder: undefined,
};

export default withTranslation()(SearchAsync);
