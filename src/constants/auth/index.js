import FieldCode from 'components/dumb/Form/Field/Code';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

export const STEP = {
  identifier: 'identifier',
  secret: 'secret',
};

export const INITIAL_VALUES = {
  [STEP.identifier]: { [STEP.identifier]: '' },
  [STEP.secret]: { [STEP.secret]: '' },
};

export const DEFAULT_SECLEVEL = 2;

export const SECLEVEL_CONFIG = {
  1: {
    fieldTypes: { [STEP.identifier]: 'email', [STEP.secret]: 'confirmationCode' },
    fieldProps: { [STEP.secret]: { component: FieldCode, helperText: '', type: 'text', inputProps: { 'data-matomo-ignore': true }, autoFocus: true } },
    api: {
      [STEP.identifier]: {
        kind: 'email',
      },
      [STEP.secret]: {
        kind: 'confirmation_code',
        formatValue: (value) => value.join(''),
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
