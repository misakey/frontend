import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import OrganizationsSchema from '@misakey/react/auth/store/schemas/Organizations';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { CIRCULAR_PROGRESS_SIZES, SMALL } from '@misakey/ui/constants/sizes';

import prop from '@misakey/core/helpers/prop';
import when from '@misakey/core/helpers/when';
import assoc from '@misakey/core/helpers/assoc';
import isSelfOrg from 'helpers/isSelfOrg';
import compose from '@misakey/core/helpers/compose';
import { pickUserPropsRemapIdentifier } from '@misakey/core/helpers/user';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import TextField from '@misakey/ui/TextField';
import ListItemOrganization from '@misakey/ui/ListItem/Organization';
import ListItemOrganizationSelf from 'components/smart/ListItem/Organization/Self';
import CircularProgress from '@material-ui/core/CircularProgress';
import AvatarUser from '@misakey/ui/Avatar/User';
import AvatarClient from '@misakey/ui/Avatar/Client/Grow';

// CONSTANTS
const { identity: IDENTITY_SELECTOR } = authSelectors;

const INPUT_EXTRA_SPACING = 2;

// HELPERS
const nameProp = prop('name');
const idProp = prop('id');
const assocName = assoc('name');

const isSelfOrgId = compose(
  isSelfOrg,
  idProp,
);

const remapValueToAvatarProps = ({ logoUrl, ...rest }) => ({ src: logoUrl, ...rest });

// HOOKS
const useStyles = makeStyles((theme) => ({
  autocompleteInputRoot: {
    flexWrap: 'nowrap',
    overflow: 'hidden',
    '& .MuiAutocomplete-input': {
      '&.MuiFilledInput-input': {
        paddingTop: 9 + theme.spacing(INPUT_EXTRA_SPACING),
        paddingBottom: 9 + theme.spacing(INPUT_EXTRA_SPACING),
      },
      minWidth: 'auto',
    },
  },
}));

// COMPONENTS
const AutocompleteOrganization = ({
  onChange, getOptionDisabled,
  textFieldProps, name, value,
  isLoading,
  ...props
}) => {
  const classes = useStyles();
  const { t } = useTranslation(['components', 'common', 'organizations', 'boxes']);

  const meIdentity = useSelector(IDENTITY_SELECTOR);
  const { displayName } = useSafeDestr(meIdentity);

  const selfOrgName = useMemo(
    () => t('boxes:create.dialog.organization.self', meIdentity),
    [meIdentity, t],
  );

  const isValueSelfOrg = useMemo(
    () => isSelfOrgId(value),
    [value],
  );

  const valueAvatarProps = useMemo(
    () => (isValueSelfOrg
      ? {
        ...pickUserPropsRemapIdentifier(meIdentity),
        size: 'small',
      }
      : {
        ...remapValueToAvatarProps(value),
        size: 'small',
      }),
    [isValueSelfOrg, meIdentity, value],
  );

  const stringify = useMemo(
    () => compose(
      nameProp,
      when(isSelfOrgId, assocName(selfOrgName)),
    ),
    [selfOrgName],
  );

  const filterOptions = useMemo(
    () => createFilterOptions({
      stringify,
    }),
    [stringify],
  );

  const handleFilterOptions = useCallback(
    (options, params) => {
      const filtered = filterOptions(options, params);
      return filtered;
    },
    [filterOptions],
  );

  const getOptionSelected = useCallback(
    ({ id }, { id: selectedId }) => id === selectedId,
    [],
  );

  const getOptionLabel = useCallback(
    ({ id, currentIdentityRole, name: optionName }) => (isSelfOrg(id)
      ? selfOrgName
      : t([
        `boxes:create.dialog.organization.other.${currentIdentityRole}`,
        'boxes:create.dialog.organization.other.default',
      ], { name: optionName })),
    [selfOrgName, t],
  );

  const renderOption = useCallback(
    ({ id, currentIdentityRole, ...rest }) => (isSelfOrg(id)
      ? (
        <ListItemOrganizationSelf
          component="div"
          disableGutters
          secondary={displayName}
        />
      ) : (
        <ListItemOrganization
          component="div"
          disableGutters
          secondary={t([`organizations:role.${currentIdentityRole}`, 'organizations:role.default'])}
          {...rest}
        />
      )),
    [displayName, t],
  );

  return (
    <Autocomplete
      classes={{
        inputRoot: classes.autocompleteInputRoot,
      }}
      name={name}
      value={value}
      onChange={onChange}
      filterOptions={handleFilterOptions}
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={({
        InputProps,
        ...params
      }) => (
        <TextField
          variant="filled"
          size="small"
          name={name}
          InputProps={{
            ...InputProps,
            startAdornment: isValueSelfOrg ? (
              <AvatarUser
                {...valueAvatarProps}
              />
            ) : (
              <AvatarClient
                {...valueAvatarProps}
              />
            ),
            endAdornment: isLoading
              ? <CircularProgress size={CIRCULAR_PROGRESS_SIZES[SMALL]} />
              : undefined,
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
  );
};

AutocompleteOrganization.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape(OrganizationsSchema.propTypes)),
  name: PropTypes.string.isRequired,
  value: PropTypes.shape(OrganizationsSchema.propTypes),
  textFieldProps: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  getOptionDisabled: PropTypes.func,
  isLoading: PropTypes.bool,
};

AutocompleteOrganization.defaultProps = {
  options: [],
  value: null,
  textFieldProps: {},
  getOptionDisabled: null,
  isLoading: false,
};

export default AutocompleteOrganization;
