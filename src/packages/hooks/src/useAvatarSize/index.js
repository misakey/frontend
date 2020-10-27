import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';

import isNumber from '@misakey/helpers/isNumber';

import { useMemo } from 'react';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

// CONSTANTS
const DEFAULT_MULTIPLIER = 1;

// HOOKS
export default (multiplier = 1) => {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const safeMultiplier = useMemo(
    () => (isNumber(multiplier) ? multiplier : DEFAULT_MULTIPLIER),
    [multiplier],
  );

  return useMemo(
    () => (isDownSm ? safeMultiplier * AVATAR_SM_SIZE : safeMultiplier * AVATAR_SIZE),
    [isDownSm, safeMultiplier],
  );
};
