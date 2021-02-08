import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import useCopy from '@misakey/hooks/useCopy';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CopyIcon from '@material-ui/icons/FilterNone';

// CONSTANTS
export const MODE = {
  icon: 'icon',
  text: 'text',
  both: 'both',
};
export const MODES = Object.values(MODE);

// COMPONENTS

const ButtonCopy = ({ value, format, message, mode, t, iconProps, ...props }) => {
  const handleCopy = useCopy(value, { format, message });

  const hasNoValue = useMemo(() => isNil(value), [value]);
  const isIcon = useMemo(() => mode === MODE.icon, [mode]);
  const isBoth = useMemo(() => mode === MODE.both, [mode]);

  const Wrapper = useMemo(() => (isIcon ? IconButton : Button), [isIcon]);

  const buttonProps = useMemo(
    () => (isIcon
      ? {}
      : { variant: 'outlined', color: 'primary' }),
    [isIcon],
  );

  return (
    <Wrapper
      disabled={hasNoValue}
      onClick={handleCopy}
      {...buttonProps}
      {...omitTranslationProps(props)}
    >
      {isBoth && (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mr={1}
      >
        <CopyIcon fontSize="small" {...iconProps} />
      </Box>
      )}
      {isIcon ? <CopyIcon {...iconProps} /> : t('common:copy')}
    </Wrapper>
  );
};

ButtonCopy.propTypes = {
  mode: PropTypes.oneOf(MODES),
  format: PropTypes.string,
  message: PropTypes.string,
  iconProps: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
  value: PropTypes.string,
};

ButtonCopy.defaultProps = {
  value: null,
  format: 'text/plain',
  message: undefined,
  mode: MODE.text,
  iconProps: {},
};

export default withTranslation('common')(ButtonCopy);
