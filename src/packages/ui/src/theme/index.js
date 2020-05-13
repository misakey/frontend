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
  zIndex: {
    max: 2000,
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
    MuiDialog: {
      paper: {
        borderRadius: '10px',
      },
    },
    MuiListItem: {
      root: {
        '&.Mui-selected': {
          borderLeftWidth: 3,
          borderLeftStyle: 'solid',
          borderLeftColor: common.secondary,
          '&.MuiListItem-gutters': {
            paddingLeft: 13,
          },
        },
      },
    },
    MuiExpansionPanel: {
      root: {
        '&::before': {
          display: 'none',
        },
        // https://github.com/mui-org/material-ui/issues/20058#issuecomment-601777593
        '&.Mui-disabled': {
          backgroundColor: 'unset',
        },
      },
    },
    MuiExpansionPanelDetails: {
      root: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        '& > ul': {
          width: '100%',
        },
      },
    },
    MuiExpansionPanelSummary: {
      content: {
        margin: 'auto 0',
        '&.Mui-expanded': {
          margin: 'auto 0',
        },
        alignItems: 'center',
      },
    },
  },
};

export default createMuiTheme(themeOptions);
