import { CONFIRMATION_CODE_SECLEVEL, PASSWORD_SECLEVEL } from '@misakey/core/auth/constants/seclevel';

export const EMAILED_CODE = 'emailed_code';
export const PREHASHED_PASSWORD = 'prehashed_password';
export const ACCOUNT_CREATION = 'account_creation';
export const RESET_PASSWORD = 'reset_password';
export const WEBAUTHN = 'webauthn';
export const TOTP = 'totp';
export const TOTP_RECOVERY = 'totp_recovery';

export const VALUE_KEY = 'value';
export const METADATA_KEYS = ['metadata', 'code'];

export const SECLEVEL_METHOD = {
  [CONFIRMATION_CODE_SECLEVEL]: EMAILED_CODE,
  [PASSWORD_SECLEVEL]: PREHASHED_PASSWORD,
};

export const METHODS = [
  EMAILED_CODE,
  PREHASHED_PASSWORD,
  ACCOUNT_CREATION,
  RESET_PASSWORD,
  WEBAUTHN,
  TOTP,
  TOTP_RECOVERY,
];


export class AuthUndefinedMethodName extends Error {
  constructor(message) {
    super(message);
    this[message] = 'undefined methodName';
  }
}
