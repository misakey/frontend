import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';

const Header = ({ children }) => (
  <Box
    width="100%"
    mt={3}
    ml={2}
  >
    <Title>{children}</Title>
  </Box>
);


Header.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Header;
