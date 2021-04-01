import { useCallback, useContext, useMemo } from 'react';
import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';

import { useSelector } from 'react-redux';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import useGetOrgFromSearchCallback from '@misakey/react-auth/hooks/useGetOrgFromSearch/callback';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HELPERS
const toClientLoginHint = ({ name, logoUrl }) => ({ client: { name, logoUri: logoUrl } });

// HOOKS
export default (canCancel = true) => {
  const { askSigninRedirect } = useContext(UserManagerContext);

  const identifier = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const identifierLoginHint = useMemo(
    () => (isNil(identifier) ? {} : { identifier }),
    [identifier],
  );

  const { organization, shouldFetch, fetch } = useGetOrgFromSearchCallback();

  const storedClientLoginHint = useMemo(
    () => {
      if (isNil(organization)) { return {}; }
      return toClientLoginHint(organization);
    },
    [organization],
  );

  return useCallback(
    async (options, overrideCanCancel) => {
      let loginHint = isEmpty(storedClientLoginHint) && isEmpty(identifierLoginHint)
        ? undefined
        : JSON.stringify({ ...storedClientLoginHint, ...identifierLoginHint });
      if (shouldFetch) {
        const org = await fetch();
        const clientLoginHint = toClientLoginHint(org);
        loginHint = JSON.stringify({
          ...storedClientLoginHint,
          ...clientLoginHint,
          ...identifierLoginHint,
        });
      }
      return askSigninRedirect(
        { loginHint, ...options },
        isNil(overrideCanCancel) ? canCancel : overrideCanCancel,
      );
    },
    [storedClientLoginHint, identifierLoginHint, shouldFetch, askSigninRedirect, canCancel, fetch],
  );
};
