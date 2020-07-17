import { useMemo } from 'react';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

export const TMP_DRAWER = 'tmpDrawer';
export const DRAWER = 'drawer';

export default () => {
  const theme = useTheme();
  // rule for dialog fullscreen
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { [TMP_DRAWER]: tmpDrawerSearch, [DRAWER]: drawerSearch } = useLocationSearchParams();

  return useMemo(
    () => ({
      isSmDown,
      tmpDrawerSearch,
      drawerSearch,
    }),
    [isSmDown, tmpDrawerSearch, drawerSearch],
  );
};
