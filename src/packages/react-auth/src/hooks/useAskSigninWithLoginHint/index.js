import { useCallback, useContext, useMemo } from 'react';
import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';

import { useSelector } from 'react-redux';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import useGetOrgFromSearch from '../useGetOrgFromSearch';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

export default (canCancel = true) => {
  const { askSigninRedirect } = useContext(UserManagerContext);

  const identifier = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const identifierLoginHint = useMemo(
    () => (isNil(identifier) ? {} : { identifier }),
    [identifier],
  );

  const { organization } = useGetOrgFromSearch();

  const clientLoginHint = useMemo(
    () => {
      if (isNil(organization)) { return {}; }
      const { name, logoUrl } = organization;
      return { client: { name, logoUri: logoUrl } };
    },
    [organization],
  );

  return useCallback(
    async (options, overrideCanCancel) => {
      const loginHint = isEmpty(clientLoginHint) && isEmpty(identifierLoginHint)
        ? undefined
        : JSON.stringify({ ...clientLoginHint, ...identifierLoginHint });
      return askSigninRedirect(
        { loginHint, ...options },
        isNil(overrideCanCancel) ? canCancel : overrideCanCancel,
      );
    },
    [askSigninRedirect, canCancel, clientLoginHint, identifierLoginHint],
  );
};
