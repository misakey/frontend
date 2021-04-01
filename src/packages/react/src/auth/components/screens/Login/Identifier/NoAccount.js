import React, { useMemo, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import authRoutes from '@misakey/react/auth/routes';

import CardUser from '@misakey/ui/Card/User';
import BoxControls from '@misakey/ui/Box/Controls';
import BoxMessage from '@misakey/ui/Box/Message';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

const {
  identifier: identifierSelector,
  loginHint: loginHintSelector,
  scope: scopeSelector,
  client: clientSelector,
} = ssoSelectors;

// COMPONENTS
const AuthLoginIdentifierNoAccount = ({ userPublicData }) => {
  const { t } = useTranslation(['auth', 'common']);
  const loginHint = useSelector(loginHintSelector);
  const identifier = useSelector(identifierSelector);
  const scope = useSelector(scopeSelector);
  const client = useSelector(clientSelector);

  const { userManager } = useContext(UserManagerContext);
  const { push } = useHistory();

  const { state: stateId, ...loginHintRest } = useMemo(() => loginHint, [loginHint]);
  const state = useMemo(() => userManager.getStateInStore(stateId), [stateId, userManager]);
  const { referrer } = useMemo(() => state || {}, [state]);

  const { name: clientName } = useMemo(() => client, [client]);
  const nextLoginHint = useMemo(
    () => JSON.stringify({ ...loginHintRest, identifier }),
    [identifier, loginHintRest],
  );

  const onSignup = useCallback(
    () => userManager.signinRedirect({ scope, referrer, loginHint: nextLoginHint, acrValues: 2 }),
    [nextLoginHint, referrer, scope, userManager],
  );

  const onNext = useCallback(
    () => push(authRoutes.signIn.secret),
    [push],
  );

  const primary = useMemo(() => ({ text: t('common:createAccount'), onClick: onSignup }), [onSignup, t]);
  const secondary = useMemo(
    () => ({ text: t('auth:login.identifier.loginAcr1'), onClick: onNext, standing: BUTTON_STANDINGS.TEXT }),
    [onNext, t],
  );

  return (
    <>
      <CardUser hideSkeleton mt={3} {...userPublicData} />
      <BoxMessage type="info" p={2} mt={1} mb={3}>
        {t('auth:login.identifier.noAccount', { clientName })}
      </BoxMessage>
      <BoxControls primary={primary} secondary={secondary} />
    </>
  );
};


AuthLoginIdentifierNoAccount.propTypes = {
  userPublicData: PropTypes.shape({
    avatarUrl: PropTypes.string,
    displayName: PropTypes.string,
    identifier: PropTypes.string,
  }).isRequired,
};


export default AuthLoginIdentifierNoAccount;
