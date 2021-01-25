import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import { createMuiTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { getThemeOptions } from '@misakey/ui/theme';
import isEmpty from '@misakey/helpers/isEmpty';

import useMediaQuery from '@material-ui/core/useMediaQuery';

function ThemeProviderNoStore({ children, previewColor }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const color = useMemo(
    () => {
      if (!isEmpty(previewColor)) {
        return previewColor;
      }
      return null;
    },
    [previewColor],
  );

  const theme = useMemo(
    () => createMuiTheme(getThemeOptions(prefersDarkMode, color)),
    [prefersDarkMode, color],
  );

  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
}

ThemeProviderNoStore.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
  previewColor: PropTypes.string,
};

ThemeProviderNoStore.defaultProps = {
  previewColor: null,
};

export default ThemeProviderNoStore;
