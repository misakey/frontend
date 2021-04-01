import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import isEmpty from '@misakey/core/helpers/isEmpty';
import isFunction from '@misakey/core/helpers/isFunction';
import prop from '@misakey/core/helpers/prop';
import emailToDisplayName from '@misakey/core/helpers/emailToDisplayName';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';


import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import TextField from '@misakey/ui/TextField';
import ListItemUser from '@misakey/ui/ListItem/User';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import Tooltip from '@material-ui/core/Tooltip';
import ChipUser from '@misakey/ui/Chip/User';

// CONSTANTS
const INITIAL_INPUT_VALUE = '';
const INPUT_SEPARATORS = [',', ';'];

const USER_EL_PROP_TYPE = {
  displayName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  identifierValue: PropTypes.string.isRequired,
};

const INPUT_EXTRA_SPACING = 2;

const INPUT_EMPTY_REGEX = new RegExp(`^[${INPUT_SEPARATORS} ]*$`);

// HELPERS
const filterOptions = createFilterOptions();
const identifierValueProp = prop('identifierValue');

const isInputEmpty = (inputValue) => INPUT_EMPTY_REGEX.test(inputValue);

const inputEndsWithSeparator = (inputValue) => INPUT_SEPARATORS
  .some((separator) => inputValue.endsWith(separator));

const valueToUserValue = (value) => ({
  displayName: emailToDisplayName(value),
  identifierValue: value,
});

// HOOKS
const useStyles = makeStyles((theme) => ({
  autocompleteInputRoot: {
    '& .MuiAutocomplete-input': {
      '&.MuiFilledInput-input': {
        paddingTop: 9 + theme.spacing(INPUT_EXTRA_SPACING),
        paddingBottom: 9 + theme.spacing(INPUT_EXTRA_SPACING),
      },
      minWidth: '50%',
      [theme.breakpoints.only('xs')]: {
        minWidth: '100%',
      },
    },
  },
  inputLabelFilled: {
    // see https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/InputLabel/InputLabel.js#L58
    transform: `translate(12px, ${20 + theme.spacing(INPUT_EXTRA_SPACING)}px) scale(1)`,
  },
}));

// COMPONENTS
const AutocompleteWhitelist = ({
  onChange, getOptionDisabled,
  textFieldProps, name, value,
  errorIndexes,
  ...props
}) => {
  const classes = useStyles();
  const { t } = useTranslation(['components', 'common']);

  const [inputValue, setInputValue] = useState(INITIAL_INPUT_VALUE);

  const inputEmpty = useMemo(
    () => isEmpty(inputValue),
    [inputValue],
  );

  const getIsOptionInValue = useCallback(
    ({ identifierValue }) => value
      .some(({
        identifierValue: itemIdentifierValue,
      }) => itemIdentifierValue === identifierValue),
    [value],
  );

  const handleGetOptionDisabled = useCallback(
    (option) => {
      const isInValue = getIsOptionInValue(option);
      if (isInValue) {
        return true;
      }
      if (isFunction(getOptionDisabled)) {
        return getOptionDisabled(option);
      }
      return false;
    },
    [getIsOptionInValue, getOptionDisabled],
  );

  const onInputChange = useCallback(
    (event, nextValue, reason) => {
      const nextValueTrimmed = nextValue.trim();
      const isNextValueEmpty = isInputEmpty(nextValueTrimmed);
      if (isNextValueEmpty) {
        setInputValue(INITIAL_INPUT_VALUE);
      } else {
        setInputValue(nextValueTrimmed);
        if (reason === 'input' && inputEndsWithSeparator(nextValueTrimmed)) {
          const inputValueWithoutSeparator = nextValueTrimmed.slice(0, -1);
          const newValue = valueToUserValue(inputValueWithoutSeparator);
          if (!handleGetOptionDisabled(newValue)) {
            onChange(event, value.concat([newValue]), 'select-option');
          }
        }
      }
    },
    [onChange, value, handleGetOptionDisabled],
  );

  const onReset = useCallback(
    (event) => {
      setInputValue(INITIAL_INPUT_VALUE);
      onChange(event, [], 'clear');
    },
    [setInputValue, onChange],
  );

  const handleFilterOptions = useCallback(
    (options, params) => {
      const filtered = filterOptions(options, params);
      const { inputValue: filterInputValue } = params;
      if (!isEmpty(filterInputValue)) {
        filtered.push(valueToUserValue(filterInputValue));
      }
      return filtered;
    },
    [],
  );

  const getOptionLabel = useCallback(
    (option) => {
      if (isEmpty(option)) {
        return '';
      }
      return identifierValueProp(option);
    },
    [],
  );

  const renderOption = useCallback(
    ({ avatarUrl, identifierValue, ...rest }) => (
      <ListItemUser
        component="div"
        disableGutters
        avatarUrl={avatarUrl}
        identifier={identifierValue}
        {...rest}
      />
    ),
    [],
  );

  const renderTags = useCallback(
    (tags, getTagProps) => (tags || []).map(({ identifierValue, ...rest }, index) => {
      const displayError = errorIndexes.includes(index);
      return (
        <Tooltip
          key={identifierValue}
          title={identifierValue}
        >
          <ChipUser
            key={identifierValue}
            identifier={identifierValue}
            error={displayError}
            {...rest}
            {...getTagProps({ index })}
          />
        </Tooltip>
      );
    }),
    [errorIndexes],
  );

  return (
    <>
      <Autocomplete
        classes={{
          inputRoot: classes.autocompleteInputRoot,
        }}
        name={name}
        value={value}
        onChange={onChange}
        onInputChange={onInputChange}
        filterOptions={handleFilterOptions}
        renderOption={renderOption}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={handleGetOptionDisabled}
        inputValue={inputValue}
        renderTags={renderTags}
        renderInput={({
          InputProps: { endAdornment, ...InputPropsRest },
          InputLabelProps,
          ...params
        }) => (
          <TextField
            variant="filled"
            name={name}
            InputProps={{
              endAdornment,
              ...InputPropsRest,
            }}
            InputLabelProps={{
              className: classes.inputLabelFilled,
              ...InputLabelProps,
            }}
            {...params}
            {...textFieldProps}
          />
        )}
        noOptionsText={null}
        autoHighlight
        clearOnBlur
        clearOnEscape
        selectOnFocus
        handleHomeEndKeys
        forcePopupIcon={false}
        disableClearable
        {...props}
      />
      {!isEmpty(value) && (
        <BoxControls
          formik
          justifyContent="flex-end"
          primary={{
            standing: BUTTON_STANDINGS.OUTLINED,
            text: t('common:add'),
            disabled: !inputEmpty,
            size: 'small',
          }}
          secondary={{
            onClick: onReset,
            text: t('common:clear'),
            size: 'small',
          }}
        />
      )}
    </>
  );
};

AutocompleteWhitelist.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape(USER_EL_PROP_TYPE)),
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.shape(USER_EL_PROP_TYPE)),
  textFieldProps: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  getOptionDisabled: PropTypes.func,
  errorIndexes: PropTypes.arrayOf(PropTypes.number),
};

AutocompleteWhitelist.defaultProps = {
  options: [],
  value: [],
  textFieldProps: {},
  getOptionDisabled: null,
  errorIndexes: [],
};

export default AutocompleteWhitelist;
