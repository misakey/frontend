import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import AutoSizer from 'react-virtualized-auto-sizer';
import WindowedList from 'components/smart/WindowedList';

// COMPONENTS
const WindowedListAutoSized = forwardRef(({ component: Component, ...props }, ref) => (
  <Box width="100%" height="100%">
    <AutoSizer>
      {(autoSizerProps) => (
        <>
          <Component
            ref={ref}
            {...autoSizerProps}
            {...props}
          />
        </>
      )}
    </AutoSizer>
  </Box>
));

WindowedListAutoSized.propTypes = {
  component: PropTypes.elementType,
};

WindowedListAutoSized.defaultProps = {
  component: WindowedList,
};

export default WindowedListAutoSized;
