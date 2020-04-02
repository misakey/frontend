import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { MuiThemeProvider } from '@material-ui/core';

import theme from '@misakey/ui/theme';

const Wrapper = ({ children }) => (

  <Suspense fallback="Loading...">
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  </Suspense>
);

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};


export default Wrapper;
