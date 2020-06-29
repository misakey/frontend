import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import isNumber from '@misakey/helpers/isNumber';

import Box from '@material-ui/core/Box';
import AutoSizer from 'react-virtualized-auto-sizer';
import WindowedList from 'components/smart/WindowedList';

// COMPONENTS
const WindowedListAutoSized = forwardRef(({
  component: Component,
  itemSize,
  itemCount,
  maxHeight,
  ...props
}, ref) => {
  const [bestHeight, setBestHeight] = useState(maxHeight);

  const itemsSize = useMemo(() => itemSize * itemCount, [itemCount, itemSize]);

  const computeBestHeight = useCallback(
    ({ height }) => {
      if (height > 0) {
        const computed = Math.min(itemsSize, height);
        setBestHeight((prevBestHeight) => (isNumber(prevBestHeight)
          ? Math.min(prevBestHeight, computed)
          : computed
        ));
      }
    },
    [itemsSize],
  );

  return (
    <Box
      width="100%"
      height={bestHeight}
    >
      <AutoSizer onResize={computeBestHeight}>
        {(autoSizerProps) => (
          <>
            <Component
              ref={ref}
              {...autoSizerProps}
              itemSize={itemSize}
              itemCount={itemCount}
              {...props}
            />
          </>
        )}
      </AutoSizer>
    </Box>
  );
});

WindowedListAutoSized.propTypes = {
  component: PropTypes.elementType,
  itemSize: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

WindowedListAutoSized.defaultProps = {
  component: WindowedList,
  maxHeight: '100vh',
};

export default WindowedListAutoSized;
