import UserManager from '@misakey/auth/classes/UserManager';

export function isSilentAuthIframe() {
  return (window.self !== window.top) && window.location.pathname === '/callback';
}

export function processSilentAuthCallbackInIframe() {
  const userManager = new UserManager(window.env.AUTH);
  return userManager.signinCallback(window.location.href, /* silent = */ true);
}
