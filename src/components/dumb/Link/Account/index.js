import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

// @FIXME temporary open a new tab for profile until account workspace is fully implemented
const AccountLink = forwardRef((props, ref) => (
  <Link ref={ref} to="/account" {...props} target="_blank" rel="noopener noreferrer" />
));

export default AccountLink;
