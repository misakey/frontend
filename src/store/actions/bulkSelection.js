export const BULK_SELECTION_TOGGLE_SELECTED = Symbol('BULK_SELECTION_TOGGLE_SELECTED');
export const BULK_SELECTION_SET_SELECTED = Symbol('BULK_SELECTION_SET_SELECTED');


export function bulkSelectionToggleSelected(applicationId) {
  return {
    type: BULK_SELECTION_TOGGLE_SELECTED,
    applicationId,
  };
}

export function bulkSelectionSetSelected(applicationIds) {
  return {
    type: BULK_SELECTION_SET_SELECTED,
    applicationIds,
  };
}
