import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import ScreenSlope from '@misakey/ui/Screen/Slope';

// COMPONENTS
const DialogPaperSlope = forwardRef((props, ref) => (
  <ScreenSlope
    ref={ref}
    component={Paper}
    {...props}
  />
));

DialogPaperSlope.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  avatar: PropTypes.node,
  avatarLarge: PropTypes.bool,
  slopeProps: PropTypes.object,
};

DialogPaperSlope.defaultProps = {
  children: null,
  header: null,
  avatar: null,
  avatarLarge: false,
  slopeProps: {},
};

export default DialogPaperSlope;
