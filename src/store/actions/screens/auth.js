
export const SCREEN_AUTH_RESET = 'SCREEN_AUTH_RESET';
export const SCREEN_AUTH_SET_EMAIL = 'SCREEN_AUTH_SET_EMAIL';
export const SCREEN_AUTH_SET_PASSWORD = 'SCREEN_AUTH_SET_PASSWORD';

export function screenAuthReset() {
  return {
    type: SCREEN_AUTH_RESET,
  };
}
export function screenAuthSetEmail(email) {
  return {
    type: SCREEN_AUTH_SET_EMAIL,
    email,
  };
}
export function screenAuthSetPassword(password) {
  return {
    type: SCREEN_AUTH_SET_PASSWORD,
    password,
  };
}
export function screenAuthSetCredentials(email, password) {
  return (dispatch) => Promise.all([
    dispatch(screenAuthSetEmail(email)),
    dispatch(screenAuthSetPassword(password)),
  ]);
}
