import React, { useMemo, useContext, useCallback } from 'react';

import PropTypes from 'prop-types';

import authRoutes from '@misakey/react/auth/routes';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useClearUser } from '@misakey/hooks/useActions/loginSecret';

import CardUser from '@misakey/ui/Card/User';
import IconButton from '@material-ui/core/IconButton';
import BoxControls from '@misakey/ui/Box/Controls';
import BoxMessage from '@misakey/ui/Box/Message';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';
import CloseIcon from '@material-ui/icons/Close';
import { IDENTITY_EMAILED_CODE } from '@misakey/core/auth/constants/amr';
import useGetAskedAuthState from '@misakey/react/auth/hooks/useGetAskedAuthState';

const { client: clientSelector } = ssoSelectors;

// COMPONENTS
const AuthLoginIdentifierNoAccount = ({ userPublicData }) => {
  const { t } = useTranslation(['auth', 'common']);
  const client = useSelector(clientSelector);

  const { userManager } = useContext(UserManagerContext);
  const { push } = useHistory();
  const dispatch = useDispatch();

  const { stateId, state } = useGetAskedAuthState();
  const { name: clientName } = useMemo(() => client, [client]);

  const onNext = useCallback(
    () => {
      dispatch(ssoSetMethodName(IDENTITY_EMAILED_CODE));
      push(authRoutes.signIn.secret);
    },
    [dispatch, push],
  );

  const onSignup = useCallback(
    async () => {
      await userManager.storeState(stateId, { ...state, shouldCreateAccount: true });
      onNext();
    },
    [onNext, state, stateId, userManager],
  );

  const onClearUser = useClearUser();

  const primary = useMemo(() => ({ text: t('common:createAccount'), onClick: onSignup }), [onSignup, t]);
  const secondary = useMemo(
    () => ({ text: t('auth:login.identifier.oneTimeCode'), onClick: onNext, standing: BUTTON_STANDINGS.TEXT }),
    [onNext, t],
  );

  return (
    <>
      <CardUser
        hideSkeleton
        mt={3}
        action={(
          <IconButton aria-label={t('common:signOut')} onClick={onClearUser}>
            <CloseIcon />
          </IconButton>
        )}
        {...userPublicData}
      />
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
