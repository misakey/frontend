import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import BoxControlsColumn from '@misakey/ui/Box/Controls/Column';

// COMPONENTS
const BoxControlsCard = forwardRef(({ minWidth, ...props }, ref) => {
  const isXs = useXsMediaQuery();

  const width = useMemo(
    () => (isXs ? '80%' : 'auto'),
    [isXs],
  );

  const minWidthOrXs = useMemo(
    () => (isXs ? null : minWidth),
    [isXs, minWidth],
  );

  return (
    <BoxControlsColumn width={width} minWidth={minWidthOrXs} ref={ref} {...props} />
  );
});

BoxControlsCard.propTypes = {
  alignSelf: PropTypes.string,
  minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

BoxControlsCard.defaultProps = {
  alignSelf: 'center',
  minWidth: null,
};

export default BoxControlsCard;
