import createUserManager from '@misakey/auth/helpers/userManager';

import routes from 'routes';


export function isSigninRedirect() {
  return window.location.pathname === routes.auth.redirectToSignIn;
}

export function processSigninRedirect() {
  const userManager = createUserManager(window.env.AUTH);
  userManager.signinRedirect({ referrer: routes.boxes._ });
}
