import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Chip from '@material-ui/core/Chip';

// COMPONENTS
const ChipLink = ({
  to,
  component: Component,
  ...rest
}) => (
  <Component
    clickable
    component={Link}
    to={to}
    {...rest}
  />
);

ChipLink.propTypes = {
  value: PropTypes.string.isRequired,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  component: PropTypes.elementType,
};

ChipLink.defaultProps = {
  component: Chip,
};

export default ChipLink;
