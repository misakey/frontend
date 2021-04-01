import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import ACCESS_LEVELS, { PUBLIC, LIMITED } from '@misakey/ui/constants/accessModes';

import isNil from '@misakey/core/helpers/isNil';

import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';

const ICONS = {
  [PUBLIC]: PublicIcon,
  [LIMITED]: LockIcon,
};

const IconSharing = forwardRef(({ value, fallback, ...props }, ref) => {
  const Icon = useMemo(
    () => ICONS[value],
    [value],
  );
  if (isNil(Icon)) {
    return fallback;
  }
  return <Icon ref={ref} {...props} />;
});

IconSharing.propTypes = {
  value: PropTypes.oneOf(ACCESS_LEVELS),
  fallback: PropTypes.node,
};

IconSharing.defaultProps = {
  value: null,
  fallback: null,
};

export default IconSharing;
