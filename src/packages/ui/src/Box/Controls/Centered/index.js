import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxControls from '@misakey/ui/Box/Controls';

// COMPONENTS
const BoxControlsCentered = ({ secondary, ...rest }) => {
  const justifyContent = useMemo(
    () => (secondary ? 'space-between' : 'center'),
    [secondary],
  );

  return (
    <BoxControls
      secondary={secondary}
      justifyContent={justifyContent}
      {...rest}
    />
  );
};

BoxControlsCentered.propTypes = {
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

BoxControlsCentered.defaultProps = {
  secondary: null,
};

export default BoxControlsCentered;
