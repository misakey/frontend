export const IDENTITY_PASSWORD = 'identity:prehashed_password';
export const IDENTITY_EMAILED_CODE = 'identity:emailed_code';
export const WEBAUTHN = 'webauthn:webauthn';
export const WEBAUTHN_RECOVERY = 'webauthn:recovery';
export const TOTP = 'totp:totp';
export const TOTP_RECOVERY = 'totp:recovery';

export const AMRS = [
  IDENTITY_EMAILED_CODE,
  IDENTITY_PASSWORD,
  WEBAUTHN,
  WEBAUTHN_RECOVERY,
  TOTP,
  TOTP_RECOVERY,
];
