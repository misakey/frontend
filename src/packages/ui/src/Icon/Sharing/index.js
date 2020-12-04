import { useMemo } from 'react';
import PropTypes from 'prop-types';

import ACCESS_LEVELS, { PRIVATE, PUBLIC, LIMITED } from '@misakey/ui/constants/accessLevels';

import isNil from '@misakey/helpers/isNil';

import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import PeopleIcon from '@material-ui/icons/People';

const ICONS = {
  [PRIVATE]: LockIcon,
  [PUBLIC]: PublicIcon,
  [LIMITED]: PeopleIcon,
};

const IconSharing = ({ value, fallback, ...props }) => {
  const Icon = useMemo(
    () => ICONS[value],
    [value],
  );
  if (isNil(Icon)) {
    return fallback;
  }
  return <Icon {...props} />;
};

IconSharing.propTypes = {
  value: PropTypes.oneOf(ACCESS_LEVELS),
  fallback: PropTypes.node,
};

IconSharing.defaultProps = {
  value: null,
  fallback: null,
};

export default IconSharing;
