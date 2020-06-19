import { CONFIRMATION_CODE_SECLEVEL, PASSWORD_SECLEVEL } from '@misakey/auth/constants/seclevel';

export const EMAILED_CODE = 'emailed_code';
export const PREHASHED_PASSWORD = 'prehashed_password';

export const VALUE_KEY = 'value';
export const METADATA_KEY = 'metadata';

export const SECLEVEL_METHOD = {
  [CONFIRMATION_CODE_SECLEVEL]: EMAILED_CODE,
  [PASSWORD_SECLEVEL]: PREHASHED_PASSWORD,
};

export const METHODS = [EMAILED_CODE, PREHASHED_PASSWORD];
