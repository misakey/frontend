import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import ChipActive from 'components/dumb/Chip/Active';

const ChipUserRequests = ({ value, onClick, ...rest }) => {
  const onChipClick = useCallback(
    (e) => onClick(e, value),
    [onClick, value],
  );

  return (
    <ChipActive
      value={value}
      onClick={onChipClick}
      {...rest}
    />
  );
};

ChipUserRequests.propTypes = {
  value: PropTypes.string.isRequired,
  activeValue: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ChipUserRequests;
