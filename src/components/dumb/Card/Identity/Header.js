import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';

const CardIdentityHeader = ({ children }) => (
  <Box
    display="flex"
    alignSelf="stretch"
    mt={3}
    ml={2}
  >
    <Title>{children}</Title>
  </Box>
);


CardIdentityHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CardIdentityHeader;
