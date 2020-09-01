import { PASSWORD_SECLEVEL, CONFIRMATION_CODE_SECLEVEL } from '@misakey/auth/constants/seclevel';
import { SECLEVEL_METHOD, METADATA_KEYS, VALUE_KEY } from '@misakey/auth/constants/method';
import { STEP } from '@misakey/auth/constants';

import FieldCode from 'components/dumb/Form/Field/Code';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

export const CONFIRM_REGEX = /^[0-9]{6}$/;

export const DEFAULT_SECLEVEL = PASSWORD_SECLEVEL;

export const SECLEVEL_CONFIG = {
  [CONFIRMATION_CODE_SECLEVEL]: {
    fieldTypes: { [STEP.identifier]: 'email', [STEP.secret]: SECLEVEL_METHOD[1] },
    fieldProps: { [STEP.secret]: { component: FieldCode, autoFocus: true } },
  },
  [PASSWORD_SECLEVEL]: {
    fieldTypes: { [STEP.identifier]: 'email', [STEP.secret]: SECLEVEL_METHOD[2] },
    fieldProps: {
      [STEP.secret]: { component: FieldTextPasswordRevealable, type: 'password', autoFocus: true, inputProps: { 'data-matomo-ignore': true } },
    },
  },
};

export const ERROR_KEYS = {
  [STEP.identifier]: [VALUE_KEY, STEP.identifier],
  [STEP.secret]: [...METADATA_KEYS, STEP.secret],
};
