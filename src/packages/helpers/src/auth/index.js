import createUserManager from '@misakey/auth/helpers/userManager';

import routes from 'routes';


export function isSigninRedirect() {
  return window.location.pathname === routes.auth.redirectToSignIn;
}

export function processSigninRedirect(useDefaultReferrer = true) {
  const userManager = createUserManager(window.env.AUTH);
  if (useDefaultReferrer) {
    userManager.signinRedirect({ referrer: routes.boxes._ });
  } else {
    userManager.signinRedirect();
  }
}
