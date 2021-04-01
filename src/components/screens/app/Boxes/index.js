import React, { useMemo } from 'react';

import { Switch, useRouteMatch, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import routes from 'routes';
import { UUID4_REGEX } from '@misakey/ui/constants/regex';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';
import { BadKeyShareFormat } from '@misakey/crypto/Errors/classes';

import isEmpty from '@misakey/core/helpers/isEmpty';
import path from '@misakey/core/helpers/path';

import useSetBoxKeyShareInUrl from '@misakey/crypto/hooks/useSetBoxKeyShareInUrl';
import useShouldDisplayLockedScreen from 'hooks/useShouldDisplayLockedScreen';

import BoxRead from 'components/screens/app/Boxes/Read';
import BoxNone from 'components/screens/app/Boxes/None';
import RouteAuthenticated from '@misakey/react-auth/components/Route/Authenticated';
import RouteAuthenticatedBoxRead from 'components/smart/Route/Authenticated/BoxRead';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import BoxEventSubmitContextProvider from 'components/smart/Box/Event/Submit/Context';

// HELPERS
const boxIdMatchParamPath = path(['match', 'params', 'id']);

// COMPONENTS
function Boxes({ match }) {
  const location = useLocation();
  const { hash: locationHash } = location;
  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const { params: { id } } = useMemo(
    () => matchBoxSelected || { params: {} },
    [matchBoxSelected],
  );

  useSetBoxKeyShareInUrl(id);

  const badKeyShareFormat = useMemo(() => {
    const keyShare = locationHash.substr(1);
    if (isEmpty(keyShare)) {
      return false;
    }
    try {
      computeInvitationHash(locationHash.substr(1));
      return false;
    } catch (error) {
      if (error instanceof BadKeyShareFormat) {
        return true;
      }
      throw error;
    }
  }, [locationHash]);

  const shouldDisplayLockedScreen = useShouldDisplayLockedScreen();

  if (badKeyShareFormat) {
    return (
      <PasteLinkScreen
        box={{
          /* this screen expects a box object but only uses the ID */
          id,
        }}
        currentLinkMalformed
      />
    );
  }

  return (
    <Switch>
      <RouteAuthenticatedBoxRead
        path={routes.boxes.read._}
        render={(renderProps) => {
          const boxId = boxIdMatchParamPath(renderProps);
          if (!UUID4_REGEX.test(boxId)) {
            return <BoxNone {...renderProps} />;
          }
          if (!shouldDisplayLockedScreen) {
            return (
              <BoxEventSubmitContextProvider>
                <BoxRead {...renderProps} />
              </BoxEventSubmitContextProvider>
            );
          }
          return null;
        }}
      />
      <RouteAuthenticated
        exact
        path={match.path}
        component={null}
      />
    </Switch>
  );
}


Boxes.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Boxes;
