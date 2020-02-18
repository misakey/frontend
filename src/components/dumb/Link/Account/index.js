import React, { forwardRef } from 'react';

import routes from 'routes';

import { Link } from 'react-router-dom';

const AccountLink = forwardRef((props, ref) => (
  <Link ref={ref} to={routes.account._} {...props} />
));

export default AccountLink;
