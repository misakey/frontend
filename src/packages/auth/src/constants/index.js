export const SIGN_IN_STATE_LENGTH = 20;

export const STORAGE_PREFIX = 'oidc.';

export const STEP = {
  identifier: 'identifier',
  secret: 'secret',
};

export const INITIAL_VALUES = {
  [STEP.identifier]: { [STEP.identifier]: '' },
  [STEP.secret]: { [STEP.secret]: '' },
};
