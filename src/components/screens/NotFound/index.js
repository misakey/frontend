import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath } from 'react-router-dom';
import routes from 'routes';
import Screen from 'components/dumb/Screen';
import Redirect from 'components/dumb/Redirect';

import { MAIN_DOMAIN_REGEX } from 'constants/regex';

function NotFound({ location: { pathname } }) {
  const slug = useMemo(() => pathname.substring(1), [pathname]);
  const isMainDomain = useMemo(() => MAIN_DOMAIN_REGEX.test(slug), [slug]);
  const error = useMemo(() => {
    const e = new Error();
    e.status = 404;
    return e;
  }, []);

  if (isMainDomain) {
    return <Redirect to={generatePath(routes.citizen.application._, { mainDomain: slug })} />;
  }

  return (
    <Screen state={{ error }} />
  );
}

NotFound.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

export default NotFound;
