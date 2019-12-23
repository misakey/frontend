import generateRandomState from '@misakey/helpers/generateRandomState';

function getSignInHref(location, authUri = 'app/auth') {
  const referrer = location ? btoa(`${location.pathname}${location.search}`) : '';
  const signInQuery = `?state=${generateRandomState()}${referrer}`;
  return `${window.env.API_ENDPOINT}/${authUri}${signInQuery}`;
}

export default getSignInHref;
