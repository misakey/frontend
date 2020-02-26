import React, { useCallback, useMemo, useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';
import eventPreventDefault from '@misakey/helpers/event/preventDefault';

import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import FieldTextPassword from './index';

// CONSTANTS
export const ADORNMENT_POSITION = {
  start: 'start',
  end: 'end',
};
const ADORNMENT_POSITIONS = Object.values(ADORNMENT_POSITION);

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

const useInputProps = (
  adornmentPosition,
  visible,
  disabled,
  onToggleVisible,
  t,
  InputProps,
) => useMemo(() => ({
  [`${adornmentPosition}Adornment`]: (
    <InputAdornment position={adornmentPosition}>
      <IconButton
        edge={adornmentPosition}
        aria-label={t('fields__new:password.toggle.visibility', 'Toggle')}
        onClick={onToggleVisible}
        onMouseDown={eventPreventDefault}
        disabled={disabled}
      >
        {visible ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>

  ),
  ...InputProps,
}), [adornmentPosition, visible, disabled, onToggleVisible, t, InputProps]);

// COMPONENTS
// @FIXME create component and update formik related one
const FieldTextPasswordRevealable = ({
  initialVisible,
  type,
  t,
  InputProps,
  adornmentPosition,
  disabled,
  forceHide,
  ...props
}) => {
  const [internalVisible, setInternalVisible] = useState(initialVisible);

  const visible = useMemo(
    () => (forceHide ? false : internalVisible),
    [internalVisible, forceHide],
  );

  const actualType = useActualType(visible, type);

  const onToggleVisible = useOnToggleVisible(setInternalVisible);

  const PasswordInputProps = useInputProps(
    adornmentPosition,
    visible,
    disabled,
    onToggleVisible,
    t,
    InputProps,
  );

  return (
    <FieldTextPassword
      {...omit(props, INTERNAL_PROPS)}
      type={actualType}
      disabled={disabled}
      InputProps={PasswordInputProps}
    />
  );
};

FieldTextPasswordRevealable.propTypes = {
  initialVisible: PropTypes.bool,
  forceHide: PropTypes.bool,
  disabled: PropTypes.bool,
  t: PropTypes.func,
  type: PropTypes.string,
  InputProps: PropTypes.object,
  adornmentPosition: PropTypes.oneOf(ADORNMENT_POSITIONS),
};

FieldTextPasswordRevealable.defaultProps = {
  initialVisible: false,
  disabled: false,
  forceHide: false,
  t: tDefault,
  type: 'password',
  InputProps: {},
  adornmentPosition: ADORNMENT_POSITION.end,
};

export default withTranslation(['fields__new'])(FieldTextPasswordRevealable);
