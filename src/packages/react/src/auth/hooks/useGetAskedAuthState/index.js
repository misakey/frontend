
import { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

const { loginHint: loginHintSelector } = ssoSelectors;

export default () => {
  const loginHint = useSelector(loginHintSelector);

  const { userManager } = useContext(UserManagerContext);

  const { state: stateId } = useMemo(() => loginHint, [loginHint]);
  const state = useMemo(() => userManager.getStateInStore(stateId), [stateId, userManager]);

  return { state, stateId };
};
