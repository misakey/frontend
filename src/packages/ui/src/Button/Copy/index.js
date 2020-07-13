import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import copy from '@misakey/helpers/copy';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import tDefault from '@misakey/helpers/tDefault';
import isNil from '@misakey/helpers/isNil';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CopyIcon from '@material-ui/icons/FilterNone';

// CONSTANTS
export const MODE = {
  icon: 'icon',
  text: 'text',
};
export const MODES = Object.values(MODE);

// COMPONENTS

const ButtonCopy = ({ value, format, mode, t, ...props }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = useCallback(() => {
    copy(value, { format });
    const text = t('common:copied');
    enqueueSnackbar(text, { variant: 'success' });
  }, [enqueueSnackbar, format, t, value]);

  const hasNoValue = useMemo(() => isNil(value), [value]);
  const isIcon = useMemo(() => mode === MODE.icon, [mode]);
  const Wrapper = useMemo(() => (isIcon ? IconButton : Button), [isIcon]);

  const buttonProps = useMemo(
    () => (isIcon
      ? {}
      : { variant: 'outlined', color: 'secondary' }),
    [isIcon],
  );

  return (
    <Wrapper
      disabled={hasNoValue}
      onClick={handleCopy}
      {...buttonProps}
      {...omitTranslationProps(props)}
    >
      {isIcon ? <CopyIcon /> : t('common:copy')}
    </Wrapper>
  );
};

ButtonCopy.propTypes = {
  mode: PropTypes.oneOf(MODES),
  format: PropTypes.string,
  t: PropTypes.func,
  value: PropTypes.string,
};

ButtonCopy.defaultProps = {
  value: null,
  format: 'text/plain',
  mode: MODE.text,
  t: tDefault,

};

export default withTranslation('common')(ButtonCopy);
