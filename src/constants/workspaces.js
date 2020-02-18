import { ROLE_LABELS } from 'constants/Roles';

// CONSTANTS
const ACCOUNT_WORKSPACE = 'account';

export const WORKSPACE = {
  ACCOUNT: ACCOUNT_WORKSPACE,
  ...ROLE_LABELS,
};

export const WORKSPACES = [
  ...Object.values(WORKSPACE),
];
