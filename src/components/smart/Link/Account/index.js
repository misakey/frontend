import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import { Link, generatePath } from 'react-router-dom';

// COMPONENTS
const AccountLink = forwardRef(({ id, ...props }, ref) => {
  const to = useMemo(
    () => generatePath(routes.accounts._, { id }),
    [id],
  );

  return (
    <Link ref={ref} to={to} {...props} />
  );
});

AccountLink.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

AccountLink.defaultProps = {
  id: null,
};

export default AccountLink;
