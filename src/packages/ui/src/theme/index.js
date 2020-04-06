import { createMuiTheme } from '@material-ui/core/styles';
import common from '@misakey/ui/colors/common';
import boulder from '@misakey/ui/colors/boulder';
import { portability, erasure } from '@misakey/ui/colors/requestTypes';

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
    portability: {
      main: portability[700],
      light: portability[500],
      dark: portability[900],
    },
    erasure: {
      main: erasure[700],
      light: erasure[500],
      dark: erasure[900],
    },
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
    MuiExpansionPanel: {
      root: {
        // https://github.com/mui-org/material-ui/issues/20058#issuecomment-601777593
        '&.Mui-disabled': {
          backgroundColor: 'unset',
        },
      },
    },
  },
};

export default createMuiTheme(themeOptions);
