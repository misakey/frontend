import createUserManager from './userManager';


export function getUrlForOidcCallback(baseUrl) {
  return baseUrl.indexOf('#') > -1 ? baseUrl.replace('#', '?') : baseUrl;
}

export function isSilentAuthIframe() {
  return (window.self !== window.top) && window.location.pathname === '/callback';
}

export function processSilentAuthCallbackInIframe() {
  const userManager = createUserManager(window.env.AUTH);
  const url = getUrlForOidcCallback(window.location.href);
  return userManager.signinSilentCallback(url);
}
