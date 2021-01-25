import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';

import { FixedSizeList } from 'react-window';
import ComponentOmit from '@misakey/ui/Component/Omit';

// CONSTANTS
export const ROW_PROP_TYPES = {
  // react-window
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

const INTERNAL_PROPS = ['isScrolling'];

// COMPONENTS
const WindowedList = forwardRef(({ Row, ...props }, ref) => {
  const RowOmit = useMemo(
    () => ComponentOmit(Row, INTERNAL_PROPS),
    [Row],
  );

  return (
    <FixedSizeList
      ref={ref}
      {...props}
    >
      {RowOmit}
    </FixedSizeList>
  );
});

WindowedList.propTypes = {
  Row: PropTypes.elementType.isRequired,
};

export default WindowedList;
