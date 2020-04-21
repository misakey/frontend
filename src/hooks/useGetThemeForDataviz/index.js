import { useMemo } from 'react';
import defaultTheme, { themeOptions } from '@misakey/ui/theme';
import { createMuiTheme } from '@material-ui/core/styles';
import isEmpty from '@misakey/helpers/isEmpty';

export default (mainColor) => useMemo(
  () => (
    isEmpty(mainColor)
      ? defaultTheme
      : createMuiTheme({
        ...themeOptions,
        palette: {
          ...themeOptions.palette,
          secondary: { main: mainColor, contrastText: 'white' },
        },
      })
  ),
  [mainColor],
);
