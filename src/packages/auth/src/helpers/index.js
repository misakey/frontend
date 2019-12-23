import getSearchParams from '@misakey/helpers/getSearchParams';
import createUserManager from './userManager';


export function getUrlForOidcCallback(baseUrl, callbackParams = null) {
  const url = baseUrl.indexOf('#') > -1 ? baseUrl.replace('#', '?') : baseUrl;
  const { expiry } = callbackParams || getSearchParams(url);
  return url.replace(`expiry=${expiry}`, `expires_in=${(Date.parse(expiry) - Date.now()) / 1000}`);
}

export function isSilentAuthIframe() {
  return (window.self !== window.top) && window.location.pathname === '/callback';
}

export function processSilentAuthCallbackInIframe() {
  const userManager = createUserManager(window.env.AUTH);
  const url = getUrlForOidcCallback(window.location.href);
  return userManager.signinSilentCallback(url);
}
