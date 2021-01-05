import routes from 'routes';

import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

import { useMemo } from 'react';
import { useLocation, generatePath } from 'react-router-dom';

// HOOKS
export default (boxId) => {
  // XXX no strong guarantee that the box in the current location
  // is the one referred to by "boxId" parameter;
  // shouldn't we get the box key share from the store instead?
  const { hash } = useLocation();

  const invitationURL = useMemo(
    () => parseUrlFromLocation(`${generatePath(routes.boxes.read._, { id: boxId })}${hash}`),
    [boxId, hash],
  );

  const boxKeyShare = useMemo(
    () => hash.substr(1),
    [hash],
  );

  return {
    invitationURL,
    boxKeyShare,
  };
};
