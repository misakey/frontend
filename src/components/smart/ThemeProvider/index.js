import React from 'react';
import PropTypes from 'prop-types';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { getThemeOptions } from '@misakey/ui/theme';

function ThemeProvider({ children, isDarkMode }) {
  // @FIXME if we want to use mediaquery to define darkmode from user preferencies
  // import useMediaQuery from '@material-ui/core/useMediaQuery';
  // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () => createMuiTheme(getThemeOptions(isDarkMode)),
    [isDarkMode],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

ThemeProvider.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  isDarkMode: state.devicePreferences.isDarkMode,
});

export default connect(mapStateToProps)(ThemeProvider);
