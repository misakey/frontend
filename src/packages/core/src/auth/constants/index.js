import { VALUE_KEY, METADATA_KEYS } from '@misakey/core/auth/constants/step';

export const STEP = {
  identifier: 'identifier',
  secret: 'secret',
};

export const INITIAL_VALUES = {
  [STEP.identifier]: { [STEP.identifier]: '' },
  [STEP.secret]: { [STEP.secret]: '' },
};

export const ERROR_KEYS = {
  [STEP.identifier]: [VALUE_KEY, STEP.identifier],
  [STEP.secret]: [...METADATA_KEYS, STEP.secret],
};
