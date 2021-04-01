import React, { useCallback, useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import eventPreventDefault from '@misakey/core/helpers/event/preventDefault';

import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import FormFieldPassword from '@misakey/ui/Form/Field/Password';

// CONSTANTS
const HIDDEN_TYPE = 'password';
const VISIBLE_DEFAULT = 'text';

// HELPERS
const getVisibleType = (type) => (type === HIDDEN_TYPE ? VISIBLE_DEFAULT : type);

// HOOKS
const useActualType = (visible, type) => useMemo(() => {
  if (visible === true) {
    return getVisibleType(type);
  }
  return HIDDEN_TYPE;
}, [visible, type]);

const useOnToggleVisible = (setVisible) => useCallback(() => {
  setVisible((visible) => !visible);
}, [setVisible]);

// COMPONENTS
const FormFieldPasswordRevealable = ({ initialVisible, type, t, InputProps, ...props }) => {
  const [visible, setVisible] = useState(initialVisible);

  const actualType = useActualType(visible, type);

  const onToggleVisible = useOnToggleVisible(setVisible);

  const InputPropsWithEndAdornment = useMemo(() => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          edge="end"
          aria-label={t('fields:password.toggle.visibility')}
          onClick={onToggleVisible}
          onMouseDown={eventPreventDefault}
        >
          {visible ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
    ...InputProps,
  }), [visible, onToggleVisible, t, InputProps]);

  return (
    <FormFieldPassword
      {...omitTranslationProps(props)}
      type={actualType}
      InputProps={InputPropsWithEndAdornment}
    />
  );
};

FormFieldPasswordRevealable.propTypes = {
  initialVisible: PropTypes.bool,
  type: PropTypes.string,
  t: PropTypes.func.isRequired,
  InputProps: PropTypes.object,
};

FormFieldPasswordRevealable.defaultProps = {
  initialVisible: false,
  type: 'password',
  InputProps: {},
};

export default withTranslation('fields')(FormFieldPasswordRevealable);
