import React from 'react';
import PropTypes from 'prop-types';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

// COMPONENTS
const BoxContent = ({ children, title, subtitle, ...props }) => (
  <Box {...props}>
    <Container maxWidth="md">
      {title}
      {subtitle}
      <Box display="flex" justifyContent="center" flexDirection="column">
        {children}
      </Box>
    </Container>
  </Box>
);

BoxContent.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
};

BoxContent.defaultProps = {
  children: null,
  title: null,
  subtitle: null,
};

export default BoxContent;
