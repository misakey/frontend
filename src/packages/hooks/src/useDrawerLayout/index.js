import { TMP_DRAWER_QUERY_PARAMS, LEFT_DRAWER_QUERY_PARAM } from '@misakey/ui/constants/drawers';

import { useMemo } from 'react';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

export default () => {
  const theme = useTheme();
  // rule for dialog fullscreen
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    [TMP_DRAWER_QUERY_PARAMS]: tmpDrawerSearch,
    [LEFT_DRAWER_QUERY_PARAM]: leftDrawerSearch,
  } = useLocationSearchParams();

  return useMemo(
    () => ({
      isSmDown,
      tmpDrawerSearch,
      leftDrawerSearch,
    }),
    [isSmDown, tmpDrawerSearch, leftDrawerSearch],
  );
};
