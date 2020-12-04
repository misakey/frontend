import { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import routes from 'routes';

import { Link, generatePath } from 'react-router-dom';

// COMPONENTS
const AccountLink = forwardRef(({ id, ...props }, ref) => {
  const to = useMemo(
    () => (isNil(id) ? null : generatePath(routes.identities._, { id })),
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
