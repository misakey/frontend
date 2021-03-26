import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';

import { VariableSizeList } from 'react-window';
import ComponentOmit from '@misakey/ui/Component/Omit';

// CONSTANTS
export const ROW_PROP_TYPES = {
  // react-window
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

const INTERNAL_PROPS = ['isScrolling'];

// COMPONENTS
const WindowedListVariableSize = forwardRef(({ Row, ...props }, ref) => {
  const RowOmit = useMemo(
    () => ComponentOmit(Row, INTERNAL_PROPS),
    [Row],
  );

  return (
    <VariableSizeList
      ref={ref}
      {...props}
    >
      {RowOmit}
    </VariableSizeList>
  );
});

WindowedListVariableSize.propTypes = {
  Row: PropTypes.elementType.isRequired,
};

export default WindowedListVariableSize;
