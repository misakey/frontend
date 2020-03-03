// @FIXME using this basic regex instead of Yup.url because it does not allow protocol omition
export const MAIN_DOMAIN_REGEX = /^(?:https?:\/\/)?(([-a-z0-9]+\.)+[a-z0-9]+).*$/;
