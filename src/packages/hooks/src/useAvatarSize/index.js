import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';

import { useMemo } from 'react';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export default () => {
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  return useMemo(
    () => (isDownSm ? AVATAR_SM_SIZE : AVATAR_SIZE),
    [isDownSm],
  );
};
