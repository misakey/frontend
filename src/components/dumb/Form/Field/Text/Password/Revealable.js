import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import eventPreventDefault from '@misakey/helpers/event/preventDefault';

import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import FieldTextPassword from '../index';

// CONSTANTS
const INTERNAL_PROPS = ['i18n', 'tReady'];
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

const useInputProps = (visible, onToggleVisible, t) => useMemo(() => ({
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
}), [visible, onToggleVisible, t]);

// COMPONENTS
const FieldTextPasswordRevealable = ({ initialVisible, type, t, ...props }) => {
  const [visible, setVisible] = useState(initialVisible);

  const actualType = useActualType(visible, type);

  const onToggleVisible = useOnToggleVisible(setVisible);

  const InputProps = useInputProps(visible, onToggleVisible, t);

  return (
    <FieldTextPassword
      {...omit(props, INTERNAL_PROPS)}
      type={actualType}
      InputProps={InputProps}
    />
  );
};

FieldTextPasswordRevealable.propTypes = {
  initialVisible: PropTypes.bool,
  type: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FieldTextPasswordRevealable.defaultProps = {
  initialVisible: false,
  type: 'password',
};

export default withTranslation('input')(FieldTextPasswordRevealable);
