import { useCallback, useContext, useMemo } from 'react';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

import { useSelector } from 'react-redux';

import isNil from '@misakey/core/helpers/isNil';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import useGetOrgFromSearchCallback from '@misakey/react/auth/hooks/useGetOrgFromSearch/callback';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HELPERS
const toClientDisplayHint = ({ name, logoUrl }) => ({ client: { name, logoUri: logoUrl } });

// HOOKS
export default (canCancel = true) => {
  const { askSigninRedirect } = useContext(UserManagerContext);

  const identifier = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const loginHint = useMemo(
    () => (isNil(identifier) ? undefined : identifier),
    [identifier],
  );

  const { organization, shouldFetch, fetch } = useGetOrgFromSearchCallback();

  const getCurrentOrg = useCallback(
    async () => {
      if (shouldFetch) {
        const org = await fetch();
        return org;
      }
      return Promise.resolve(organization);
    },
    [fetch, organization, shouldFetch],
  );

  return useCallback(
    async (options, overrideCanCancel) => {
      const org = await getCurrentOrg();
      const displayHints = isNil(org) ? undefined : toClientDisplayHint(org);
      return askSigninRedirect(
        { loginHint, displayHints, ...options },
        isNil(overrideCanCancel) ? canCancel : overrideCanCancel,
      );
    },
    [getCurrentOrg, askSigninRedirect, loginHint, canCancel],
  );
};
