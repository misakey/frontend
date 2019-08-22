import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const AccountLink = forwardRef((props, ref) => (
  <Link ref={ref} to="/account" {...props} />
));

export default AccountLink;
