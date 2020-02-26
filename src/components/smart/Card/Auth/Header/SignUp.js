import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import CardHeaderAuth from 'components/smart/Card/Auth/Header';
import ProgressSignUp from 'components/smart/Progress/SignUp';

const CardHeaderAuthSignUp = ({ className, ...props }) => (
  <Box className={className}>
    <CardHeaderAuth {...props} />
    <ProgressSignUp {...props} />
  </Box>
);

CardHeaderAuthSignUp.propTypes = {
  className: PropTypes.string,
};

CardHeaderAuthSignUp.defaultProps = {
  className: '',
};

export default CardHeaderAuthSignUp;
