export const UPDATE_MAILER = Symbol('UPDATE_MAILER');
export const TOGGLE_DARKMODE = Symbol('TOGGLE_DARKMODE');

export const updateMailer = (mailer) => ({
  type: UPDATE_MAILER,
  mailer,
});

export const toggleDarkmode = () => ({
  type: TOGGLE_DARKMODE,
});
