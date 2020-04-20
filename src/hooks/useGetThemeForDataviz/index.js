import { useMemo } from 'react';
import { themeOptions } from '@misakey/ui/theme';
import { createMuiTheme } from '@material-ui/core/styles';

export default (mainColor) => useMemo(
  () => createMuiTheme({
    ...themeOptions,
    palette: {
      ...themeOptions.palette,
      secondary: { main: mainColor, contrastText: 'white' },
    },
  }),
  [mainColor],
);
