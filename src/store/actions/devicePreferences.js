export const UPDATE_MAILER = Symbol('UPDATE_MAILER');

export const updateMailer = (mailer) => ({
  type: UPDATE_MAILER,
  mailer,
});
