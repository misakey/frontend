import { createMuiTheme } from '@material-ui/core/styles';
import common from '@misakey/ui/colors/common';
import boulder from '@misakey/ui/colors/boulder';

export const themeOptions = {
  palette: {
    primary: {
      main: common.primary,
    },
    secondary: {
      main: common.secondary,
    },
    error: {
      main: common.secondary,
    },
    grey: boulder,
  },
  typography: {
    useNextVariants: true,
  },
  overrides: {
    MuiLink: {
      root: {
        color: common.secondary,
      },
    },
  },
};

export default createMuiTheme(themeOptions);
