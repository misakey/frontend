import FieldCode from 'components/dumb/Form/Field/Code';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

export const STEP = {
  identifier: 'identifier',
  secret: 'secret',
};

export const DEFAULT_SECLEVEL = 2;

export const SECLEVEL_CONFIG = {
  1: {
    fieldTypes: { [STEP.identifier]: 'email', [STEP.secret]: 'confirmationCode' },
    fieldProps: { [STEP.secret]: { component: FieldCode, type: 'text', autoFocus: true } },
    api: {
      [STEP.identifier]: {
        kind: 'email',
      },
      [STEP.secret]: {
        kind: 'confirmation_code',
      },
    },
  },
  2: {
    fieldTypes: { [STEP.identifier]: 'email', [STEP.secret]: 'password' },
    fieldProps: {
      [STEP.secret]: { component: FieldTextPasswordRevealable, type: 'password', autoFocus: true, inputProps: { 'data-matomo-ignore': true } },
    },
    api: {
      [STEP.identifier]: { kind: 'email' },
      [STEP.secret]: { kind: 'password' },
    },
  },
};

export const ERROR_KEYS = {
  [STEP.identifier]: ['email', 'identifier'],
  [STEP.secret]: ['password', 'confirmationCode', 'secret'],
};
