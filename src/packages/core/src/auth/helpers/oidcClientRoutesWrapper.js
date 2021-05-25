import UserManager from '@misakey/core/auth/classes/UserManager';
import handlePureLoginRoute from '@misakey/core/auth/helpers/handlePureLoginRoute';

const oidcClientRoutesWrapper = (config, instanciateAppFn) => {
  // The main purpose of the iframe is to launch auth request and update user
  // in localStorage when the request is finished. It doesn't need to load the
  // rest of the application and if it does, the iframe can throw timeout errors
  // https://github.com/maxmantz/redux-oidc/issues/48#issuecomment-315422236
  const isSilentAuthIframe = (window.self !== window.top) && window.location.pathname === '/callback';
  if (isSilentAuthIframe) {
    const userManager = new UserManager(config);
    return userManager.signinCallback(window.location.href, /* silent = */ true);
  }

  // The main purpose of this route is to launch an auth request with the query params passed
  // there is no need to load the react app here
  const isPureSignInRoute = window.location.pathname === '/signIn';
  if (isPureSignInRoute) {
    return handlePureLoginRoute(config);
  }

  return instanciateAppFn();
};

export default oidcClientRoutesWrapper;
