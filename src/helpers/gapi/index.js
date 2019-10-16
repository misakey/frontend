import includes from '@misakey/helpers/includes';

// CONSTANTS
const { GAPI_CLIENT_ID } = window.env;

// HELPERS
const getLibList = (libs) => libs.split(':');

const hasLib = (libs, lib) => {
  const libList = getLibList(libs);
  return includes(libList, lib);
};

const init = (libs, discoveryDocs, scope) => (hasLib(libs, 'client')
  ? window.gapi.client.init({
    clientId: GAPI_CLIENT_ID,
    discoveryDocs,
    scope,
  })
  : window.gapi.auth2.init({
    clientId: GAPI_CLIENT_ID,
    discoveryDocs,
    scope,
  }));

export const askAuth = (libs, discoveryDocs, scope) => (
  callback, onError,
) => () => init(libs, discoveryDocs, scope)
  .then(() => {
    const AuthInstance = window.gapi.auth2.getAuthInstance();
    const isSignedIn = AuthInstance.isSignedIn.get();
    if (isSignedIn) { return Promise.resolve(isSignedIn); }

    return AuthInstance.signIn();
  })
  .then(callback, onError);

export const onGApiLoad = (libs, discoveryDocs, scope) => (callback, onError) => () => {
  const gApiLibs = hasLib(libs, 'auth2') ? libs : `auth2:${libs}`;
  return new Promise((resolve, reject) => {
    window.gapi.load(gApiLibs, {
      callback: resolve,
      onerror: reject,
    });
  })
    .then(askAuth(libs, discoveryDocs, scope)(callback, onError));
};
