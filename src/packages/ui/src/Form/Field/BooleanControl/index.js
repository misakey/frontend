import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import isEmpty from '@misakey/core/helpers/isEmpty';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// COMPONENTS
// NB: control can be for instance
// - Checkbox from '@material-ui/core/Checkbox'
// - Switch Checkbox from '@material-ui/core/Switch'
const FieldBooleanControl = ({
  control: Control,
  classes,
  displayError, errorKeys, field, form, helperText,
  defaultValue,
  label,
  labels,
  t, ...rest
}) => {
  const { value, name } = useSafeDestr(field);
  const { setFieldValue } = useSafeDestr(form);

  const checked = useMemo(
    () => (isNil(value) ? defaultValue : value),
    [defaultValue, value],
  );

  const isXs = useXsMediaQuery();

  const { onChange, ...fieldRest } = useMemo(() => field, [field]);

  const onControlChange = useCallback(
    (e) => {
      setFieldValue(name, !checked);
      if (isFunction()) { onChange(e); }
    },
    [setFieldValue, name, checked, onChange],
  );

  const labelOrLabelsValue = useMemo(
    () => {
      if (isEmpty(labels)) {
        return label;
      }
      return labels[checked];
    },
    [label, labels, checked],
  );

  const labelPlacement = useMemo(
    () => (isXs ? 'bottom' : 'end'),
    [isXs],
  );

  return (
    <FormControl error={displayError}>
      <FormGroup>
        <FormControlLabel
          classes={{ root: classes.label, label: classes.labelTypography }}
          control={(
            <Control
              className={classes.control}
              checked={checked}
              onChange={onControlChange}
              {...fieldRest}
              {...omitTranslationProps(rest)}
            />
          )}
          label={labelOrLabelsValue}
          labelPlacement={labelPlacement}
        />
        {(displayError || helperText) && (
          <FormHelperText>{displayError ? t(errorKeys) : helperText}</FormHelperText>
        )}
      </FormGroup>
    </FormControl>
  );
};

FieldBooleanControl.propTypes = {
  control: PropTypes.elementType.isRequired,
  classes: PropTypes.object,
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultValue: PropTypes.bool,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.bool,
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  helperText: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.object]),
  labels: PropTypes.shape({
    true: PropTypes.node,
    false: PropTypes.node,
  }),
  // withTranslation
  t: PropTypes.func.isRequired,
};

FieldBooleanControl.defaultProps = {
  classes: {},
  className: '',
  defaultValue: undefined,
  helperText: '',
  label: '',
  labels: {},
};

export default withTranslation('fields')(withErrors(FieldBooleanControl));
