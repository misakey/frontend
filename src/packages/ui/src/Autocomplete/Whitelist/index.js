import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { IDENTIFIER as USER_TYPE, EMAIL_DOMAIN as DOMAIN_TYPE } from '@misakey/ui/constants/accessTypes';

import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import emailToDisplayName from '@misakey/helpers/emailToDisplayName';

import { useTranslation } from 'react-i18next';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import TextField from '@misakey/ui/TextField';
import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemDomain from '@misakey/ui/ListItem/Domain';
import AutocompleteWhitelistPaper from '@misakey/ui/Autocomplete/Whitelist/Paper';

// CONSTANTS
const TYPES = [DOMAIN_TYPE, USER_TYPE];

// HELPERS
const filterOptions = createFilterOptions();
const valueProp = prop('value');

const isDomainString = (string) => string.startsWith('*@');

// COMPONENTS
const AutocompleteWhitelist = ({ onChange, textFieldProps, name, ...props }) => {
  const { t } = useTranslation('components');

  const handleFilterOptions = useCallback(
    (options, params) => {
      const filtered = filterOptions(options, params);
      const { inputValue } = params;
      if (!isEmpty(inputValue)) {
        if (isDomainString(inputValue)) {
          filtered.push({
            type: DOMAIN_TYPE,
            displayName: t('components:whitelist.domainTitle'),
            identifier: {
              value: inputValue.replace('*@', ''),
            },
          });
          return filtered;
        }
        filtered.push({
          type: USER_TYPE,
          displayName: emailToDisplayName(inputValue),
          identifier: {
            value: inputValue,
          },
        });
      }
      return filtered;
    },
    [t],
  );

  const getOptionLabel = useCallback(
    (option) => {
      if (isEmpty(option)) {
        return '';
      }
      return valueProp(option.identifier);
    },
    [],
  );

  const renderOption = useCallback(
    ({ type, avatarUrl, identifier, ...rest }) => {
      const identifierValue = valueProp(identifier);
      if (type === DOMAIN_TYPE) {
        return (
          <ListItemDomain
            component="div"
            disableGutters
            identifier={identifierValue}
            {...rest}
          />
        );
      }
      return (
        <ListItemUser
          component="div"
          disableGutters
          avatarUrl={avatarUrl}
          identifier={identifierValue}
          {...rest}
        />
      );
    },
    [],
  );

  return (
    <Autocomplete
      name={name}
      onChange={onChange}
      filterOptions={handleFilterOptions}
      renderOption={renderOption}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => (
        <TextField variant="standard" name={name} {...params} {...textFieldProps} />
      )}
      noOptionsText={null}
      PaperComponent={AutocompleteWhitelistPaper}
      autoHighlight
      blurOnSelect
      clearOnBlur
      clearOnEscape
      selectOnFocus
      handleHomeEndKeys
      {...props}
    />
  );
};

AutocompleteWhitelist.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(TYPES).isRequired,
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    identifier: PropTypes.shape({
      value: PropTypes.string.isRequired,
    }).isRequired,
  })),
  name: PropTypes.string.isRequired,
  textFieldProps: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

AutocompleteWhitelist.defaultProps = {
  options: [],
  textFieldProps: {},
};

export default AutocompleteWhitelist;
