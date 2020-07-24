import { CONFIRMATION_CODE_SECLEVEL, PASSWORD_SECLEVEL } from '@misakey/auth/constants/seclevel';

export const EMAILED_CODE = 'emailed_code';
export const PREHASHED_PASSWORD = 'prehashed_password';
export const ACCOUNT_CREATION = 'account_creation';

export const VALUE_KEY = 'value';
export const METADATA_KEYS = ['metadata', 'code'];
export const PASSWORD_RESET_KEY = 'passwordReset';

export const SECLEVEL_METHOD = {
  [CONFIRMATION_CODE_SECLEVEL]: EMAILED_CODE,
  [PASSWORD_SECLEVEL]: PREHASHED_PASSWORD,
};

export const METHODS = [EMAILED_CODE, PREHASHED_PASSWORD, ACCOUNT_CREATION];
