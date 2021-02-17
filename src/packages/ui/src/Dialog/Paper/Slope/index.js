import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';

import { SIZES, MEDIUM } from '@misakey/ui/Avatar';

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
  avatarSize: PropTypes.oneOf(SIZES),
  slopeProps: PropTypes.object,
};

DialogPaperSlope.defaultProps = {
  children: null,
  header: null,
  avatar: null,
  avatarSize: MEDIUM,
  slopeProps: {},
};

export default DialogPaperSlope;
