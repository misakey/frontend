import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath } from 'react-router-dom';
import routes from 'routes';
import Screen from 'components/dumb/Screen';
import Redirect from 'components/dumb/Redirect';

import { MAIN_DOMAIN_REGEX } from 'constants/regex';

// CONSTANTS
const NOT_FOUND_ERROR = new Error();
NOT_FOUND_ERROR.status = 404;

const ERROR_STATE = {
  error: NOT_FOUND_ERROR,
};

// COMPONENTS
function NotFound({ location: { pathname } }) {
  const slug = useMemo(() => pathname.substring(1), [pathname]);
  const isMainDomain = useMemo(() => MAIN_DOMAIN_REGEX.test(slug), [slug]);

  if (isMainDomain) {
    return <Redirect to={generatePath(routes.citizen.application._, { mainDomain: slug })} />;
  }

  return (
    <Screen state={ERROR_STATE} />
  );
}

NotFound.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

export default NotFound;
