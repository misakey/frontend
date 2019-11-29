import React from 'react';
import PropTypes from 'prop-types';

import BoxControls from 'components/dumb/Box/Controls';

const CardControls = (props) => (
  <BoxControls outlined={false} {...props} />
);

CardControls.propTypes = {
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

CardControls.defaultProps = {
  primary: null,
  secondary: null,
};

export default CardControls;
