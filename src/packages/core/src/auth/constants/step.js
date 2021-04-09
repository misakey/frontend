export const AUTH_STEP_KEY = 'authnStep';

export const NEXT_STEP_REDIRECT = 'redirect';
export const NEXT_STEP_AUTH = 'authn_step';

export const VALUE_KEY = 'value';
export const METADATA_KEYS = ['metadata', 'code'];

export class AuthUndefinedMethodName extends Error {
  constructor(message) {
    super(message);
    this[message] = 'undefined methodName';
  }
}
