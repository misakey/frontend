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
    MuiButton: {
      root: {
        boxShadow: 'none !important',
        borderRadius: 50,
      },
    },
    MuiCardContent: {
      root: {
        '&:last-child': {
          paddingBottom: null,
        },
      },
    },
    MuiListItem: {
      root: {
        '&.Mui-selected': {
          borderLeft: `3px solid ${common.secondary}`,
          '&.MuiListItem-gutters': {
            paddingLeft: 13,
          },
        },
      },
    },
  },
};

export default createMuiTheme(themeOptions);
