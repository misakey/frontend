import React from 'react';
import PropTypes from 'prop-types';

import theme from '@misakey/ui/theme';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
};
export default ThemeProvider;
