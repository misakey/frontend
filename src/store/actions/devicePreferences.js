export const UPDATE_MAILER = Symbol('UPDATE_MAILER');
export const INIT_DARKMODE = Symbol('INIT_DARKMODE');
export const TOGGLE_DARKMODE = Symbol('TOGGLE_DARKMODE');

export const updateMailer = (mailer) => ({
  type: UPDATE_MAILER,
  mailer,
});

export const initDarkMode = (isDarkMode = false) => ({
  type: INIT_DARKMODE,
  isDarkMode,
});

export const toggleDarkmode = () => ({
  type: TOGGLE_DARKMODE,
});
