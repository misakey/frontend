import isNil from '@misakey/core/helpers/isNil';
import UserManager from '@misakey/core/auth/classes/UserManager';

export default (config) => {
  const userManager = new UserManager(config);
  const {
    targetPathname: referrer = '/',
    misakeyCallbackHints: jsonHints,
    ...rest
  } = Object.fromEntries(new URLSearchParams(window.location.search));

  const misakeyCallbackHints = isNil(jsonHints) ? undefined : JSON.parse(jsonHints);

  return userManager.signinRedirect({ referrer, misakeyCallbackHints, ...rest });
};
