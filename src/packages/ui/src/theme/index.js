import { createMuiTheme, fade } from '@material-ui/core/styles';
import common from '@misakey/ui/colors/common';
import boulder from '@misakey/ui/colors/boulder';

import isEmpty from '@misakey/helpers/isEmpty';

// CONSTANTS
const BLACK = '#000';
const WHITE = '#fff';

const DARK_BG = '#303030';
const LIGHT_BG = '#fff';

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

// THEME
export const getThemeOptions = (isDarkMode = false, color = null) => ({
  palette: {
    common: {
      black: BLACK,
      white: WHITE,
    },
    type: isDarkMode ? THEMES.DARK : THEMES.LIGHT,
    primary: {
      main: isEmpty(color) ? common.primary : color,
    },
    secondary: {
      main: common.secondary,
    },
    background: {
      message: isDarkMode ? '#555555' : '#F5F5F5',
      paper: isDarkMode ? DARK_BG : LIGHT_BG,
      default: isDarkMode ? DARK_BG : LIGHT_BG,
    },
    action: {
      hover: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
      hoverOpacity: isDarkMode ? 0.04 : 0.02,
      selected: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      selectedOpacity: isDarkMode ? 0.08 : 0.04,
    },
    grey: boulder,
    reverse: {
      background: {
        paper: isDarkMode ? LIGHT_BG : DARK_BG,
        default: isDarkMode ? LIGHT_BG : DARK_BG,
      },
      action: {
        hover: isDarkMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.04)',
        hoverOpacity: isDarkMode ? 0.02 : 0.04,
        selected: isDarkMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
        selectedOpacity: isDarkMode ? 0.04 : 0.08,
      },
    },
  },
  typography: {
    useNextVariants: true,
  },
  shape: {
    borderRadius: 8,
  },
  zIndex: {
    max: 2000,
  },
  overrides: {
    MuiAccordion: {
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
    MuiAccordionDetails: {
      root: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        '& > ul': {
          width: '100%',
        },
      },
    },
    MuiAccordionSummary: {
      content: {
        margin: 'auto 0',
        '&.Mui-expanded': {
          margin: 'auto 0',
        },
        alignItems: 'center',
      },
    },
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
    MuiFilledInput: {
      root: {
        backgroundColor: isEmpty(color) ? fade(common.primary, 0.03) : fade(color, 0.03),
        '@media (hover:none)': {
          '&:hover': {
            backgroundColor: isEmpty(color) ? `${fade(common.primary, 0.07)} !important` : `${fade(color, 0.07)} !important`,
          },
        },
        '&:hover': {
          backgroundColor: isEmpty(color) ? fade(common.primary, 0.07) : fade(color, 0.07),
        },
        '&$focused': {
          backgroundColor: isEmpty(color) ? fade(common.primary, 0.03) : fade(color, 0.03),
        },
        '&$disabled': {
          backgroundColor: isEmpty(color) ? fade(common.primary, 0.06) : fade(color, 0.06),
        },
      },
    },
    MuiListItem: {
      root: {
        '&$selected': {
          borderLeftWidth: 3,
          borderLeftStyle: 'solid',
          borderLeftColor: isEmpty(color) ? common.primary : color,
          '&$gutters': {
            paddingLeft: 13,
          },
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: fade(BLACK, 0.5),
      },
    },
  },
});

export default createMuiTheme(getThemeOptions());
