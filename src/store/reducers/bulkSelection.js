import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  BULK_SELECTION_TOGGLE_SELECTED,
  BULK_SELECTION_SET_SELECTED,
} from 'store/actions/bulkSelection';

const initialState = { selected: [] };

function bulkSelectionToggleSelected(state, { applicationId }) {
  const { selected } = state;
  if (selected.includes(applicationId)) {
    return { ...state, selected: selected.filter((id) => applicationId !== id) };
  }
  return { ...state, selected: [...selected, applicationId] };
}

function bulkSelectionSetSelected(state, { applicationIds }) {
  return { ...state, selected: applicationIds };
}

export default createReducer(initialState, {
  [BULK_SELECTION_TOGGLE_SELECTED]: bulkSelectionToggleSelected,
  [BULK_SELECTION_SET_SELECTED]: bulkSelectionSetSelected,
});
