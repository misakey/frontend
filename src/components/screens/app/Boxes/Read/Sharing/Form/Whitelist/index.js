import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import { LIMITED } from '@misakey/ui/constants/accessModes';

import propEq from '@misakey/helpers/propEq';
import prop from '@misakey/helpers/prop';

import { useFormikContext } from 'formik';

import Field from '@misakey/ui/Form/Field';
import AutocompleteWhitelistField from '@misakey/ui/Autocomplete/Whitelist/Field';

// COMPONENTS
const SharingFormWhitelist = ({ parent, name, initialValue, disabled, ...props }) => {
  const { values, setFieldValue, setFieldTouched, setFieldError } = useFormikContext();

  const whitelistEnabled = useMemo(
    () => propEq(parent, LIMITED, values),
    [parent, values],
  );

  const value = useMemo(
    () => prop(name, values),
    [name, values],
  );

  useEffect(
    () => {
      if (!whitelistEnabled) {
        // reset field without resetting rest of form
        if (value !== initialValue) {
          setFieldValue(name, initialValue);
        }
        setFieldTouched(name, false, false);
        setFieldError(name, null);
      }
    },
    [
      setFieldValue, setFieldTouched, setFieldError,
      whitelistEnabled, initialValue, name, value,
    ],
  );

  return (
    <Field
      prefix="boxes."
      name={name}
      disabled={!whitelistEnabled || disabled}
      component={AutocompleteWhitelistField}
      fullWidth
      {...props}
    />
  );
};

SharingFormWhitelist.propTypes = {
  parent: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  initialValue: PropTypes.arrayOf(PropTypes.object),
  disabled: PropTypes.bool,
};

SharingFormWhitelist.defaultProps = {
  initialValue: null,
  disabled: false,
};

export default SharingFormWhitelist;
