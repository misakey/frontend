
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import authRoutes from '@misakey/react/auth/routes';

import { ssoUpdate, onSetIdentifier } from '@misakey/react/auth/store/actions/sso';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import updateAuthIdentities from '@misakey/core/auth/builder/updateAuthIdentities';
import isNil from '@misakey/core/helpers/isNil';

const { acr: askedAcrSelectors } = ssoSelectors;

export default (loginChallenge) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { search } = useLocation();
  const askedAcr = useSelector(askedAcrSelectors);

  return useCallback(
    (nextIdentifier) => updateAuthIdentities({ loginChallenge, identifierValue: nextIdentifier })
      .then((response) => {
        const { identity } = response;
        const { hasAccount } = identity;
        return Promise.all([
          dispatch(ssoUpdate(response)),
          dispatch(onSetIdentifier(nextIdentifier)),
        ]).then(() => {
          if (hasAccount || !isNil(askedAcr)) {
            push({ pathname: authRoutes.signIn.secret, search });
          }
        });
      }),
    [loginChallenge, dispatch, askedAcr, push, search],
  );
};
