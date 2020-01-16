export const APPLICATIONS_SELECTED_TOGGLE = Symbol('APPLICATIONS_SELECTED_TOGGLE');
export const APPLICATIONS_SELECTED_SET = Symbol('APPLICATIONS_SELECTED_SET');


export function toggleFromSelected(applicationId) {
  return {
    type: APPLICATIONS_SELECTED_TOGGLE,
    applicationId,
  };
}

export function setSelected(applicationIds) {
  return {
    type: APPLICATIONS_SELECTED_SET,
    applicationIds,
  };
}
