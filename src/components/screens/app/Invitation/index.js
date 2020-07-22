import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Redirect } from 'react-router-dom';
import routes from 'routes';

function Invitation({ location: { hash } }) {
  const [id, invitationShare] = useMemo(() => hash.substr(1).split('&'), [hash]);
  const redirectTo = useMemo(
    () => ({
      pathname: generatePath(routes.boxes.read._, { id }),
      hash: `#${invitationShare}`,
    }),
    [id, invitationShare],
  );

  return <Redirect to={redirectTo} />;
}

Invitation.propTypes = {
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
};

export default Invitation;
