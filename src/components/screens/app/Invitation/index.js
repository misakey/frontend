import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import withDialogPassword from 'components/smart/Dialog/Password/with';

import { selectors } from '@misakey/crypto/store/reducer';
import { addBoxSecretKey } from '@misakey/crypto/store/actions/concrete';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

function Invitation({ location: { hash }, onClick }) {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);
  const dispatch = useDispatch();

  const [id, secretKey] = useMemo(() => hash.substr(1).split('&'), [hash]);
  const redirectTo = useMemo(() => generatePath(routes.boxes.read._, { id }), [id]);

  const { accountId, id: identityId } = useSelector(getCurrentUserSelector) || {};
  const isCryptoLoadedSelector = useMemo(() => selectors.isCryptoLoaded, []);
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

  // if user has a backup they must wait for backup to be loaded in order to add the new key
  // if user has no backup they can keep forward
  const isCryptoReady = useMemo(
    () => isCryptoLoaded || (!isNil(identityId) && isNil(accountId)),
    [accountId, identityId, isCryptoLoaded],
  );

  const shouldOpenVault = useMemo(
    () => !isNil(accountId) && !isCryptoLoaded, [accountId, isCryptoLoaded],
  );

  const shouldStoreSecretAndRedirect = useMemo(
    () => secretKey && !isReadyToRedirect && isCryptoReady,
    [isCryptoReady, isReadyToRedirect, secretKey],
  );

  useEffect(() => {
    if (shouldOpenVault) { onClick(); }
  }, [onClick, shouldOpenVault]);

  useEffect(
    () => {
      // @FIXME crypto: should fetch other part of key on backend
      // (see https://gitlab.misakey.dev/misakey/frontend/-/issues/603)
      if (shouldStoreSecretAndRedirect) {
        dispatch(addBoxSecretKey(secretKey));
        setIsReadyToRedirect(true);
      }
    },
    [dispatch, secretKey, shouldStoreSecretAndRedirect],
  );

  if (isReadyToRedirect) {
    return <Redirect to={redirectTo} />;
  }

  return <SplashScreen />;
}

Invitation.propTypes = {
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default withDialogPassword(Invitation);
