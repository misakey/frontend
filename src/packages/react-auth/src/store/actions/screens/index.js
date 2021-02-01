
export const SCREEN_AUTH_RESET = Symbol('SCREEN_AUTH_RESET');
export const SCREEN_AUTH_SET_IDENTIFIER = Symbol('SCREEN_AUTH_SET_IDENTIFIER');
export const SCREEN_AUTH_SET_SECRET = Symbol('SCREEN_AUTH_SET_SECRET');
export const SCREEN_AUTH_SET_PUBLICS = Symbol('SCREEN_AUTH_SET_PUBLICS');

export function screenAuthReset() {
  return {
    type: SCREEN_AUTH_RESET,
  };
}
export function screenAuthSetIdentifier(identifier) {
  return {
    type: SCREEN_AUTH_SET_IDENTIFIER,
    identifier,
  };
}

export const screenAuthSetPublics = (publics) => ({
  type: SCREEN_AUTH_SET_PUBLICS,
  publics,
});

export function screenAuthSetSecret(secret) {
  return {
    type: SCREEN_AUTH_SET_SECRET,
    secret,
  };
}
export function screenAuthSetCredentials(identifier, secret) {
  return (dispatch) => Promise.all([
    dispatch(screenAuthSetIdentifier(identifier)),
    dispatch(screenAuthSetSecret(secret)),
  ]);
}
