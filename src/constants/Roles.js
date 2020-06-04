// TODO: synchro with backend
export const ROLE_IDS = { CITIZEN: 0, ADMIN: 1, DPO: 2 };
export const ROLE_LABELS = { CITIZEN: 'citizen', ADMIN: 'admin', DPO: 'dpo' };

export const ROLE_IDS_BY_LABEL = {};
export const ROLE_LABELS_BY_ROLE_IDS = {};

export const ROLE_PREFIX_SCOPE = 'rol';
export const DEFAULT_SCOPE = 'openid';

Object.keys(ROLE_IDS).forEach((key) => {
  ROLE_IDS_BY_LABEL[ROLE_LABELS[key]] = ROLE_IDS[key];
  ROLE_LABELS_BY_ROLE_IDS[ROLE_IDS[key]] = ROLE_LABELS[key];
});

export default {
  ids: Object.values(ROLE_IDS),
  labels: Object.values(ROLE_LABELS),
  getLabelById: (id) => ROLE_LABELS_BY_ROLE_IDS[id],
  getIdByLabel: (label) => ROLE_IDS_BY_LABEL[label],
};
