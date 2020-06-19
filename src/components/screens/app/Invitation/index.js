import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import routes from 'routes';
import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

function Invitation({ location: { hash } }) {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);
  const [id, secretKey] = useMemo(() => hash.substr(1).split('&'), [hash]);
  const redirectTo = useMemo(() => generatePath(routes.boxes.read._, { id }), [id]);
  const dispatch = useDispatch();

  useEffect(
    () => {
      // @FIXME crypto: should fetch other part of key on backend
      // (see https://gitlab.misakey.dev/misakey/frontend/-/issues/603)
      if (secretKey && !isReadyToRedirect) {
        dispatch(addBoxSecretKey(secretKey));
        setIsReadyToRedirect(true);
      }
    },
    [dispatch, isReadyToRedirect, secretKey],
  );

  if (isReadyToRedirect) {
    return <Redirect to={redirectTo} />;
  }

  return <SplashScreen />;
}

Invitation.propTypes = {
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
};

export default Invitation;
