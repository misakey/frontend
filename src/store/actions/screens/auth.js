
export const SCREEN_AUTH_RESET = 'SCREEN_AUTH_RESET';
export const SCREEN_AUTH_SET_IDENTIFIER = 'SCREEN_AUTH_SET_IDENTIFIER';
export const SCREEN_AUTH_SET_SECRET = 'SCREEN_AUTH_SET_SECRET';

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
