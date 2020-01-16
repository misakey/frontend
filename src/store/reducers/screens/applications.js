import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  APPLICATIONS_SELECTED_TOGGLE,
  APPLICATIONS_SELECTED_SET,
} from 'store/actions/screens/applications';

const initialState = { selected: [] };

function toggleFromSelectedApplications(state, { applicationId }) {
  if (state.selected.includes(applicationId)) {
    return { ...state, selected: state.selected.filter((id) => applicationId !== id) };
  }
  return { ...state, selected: [...state.selected, applicationId] };
}

function setSelected(state, { applicationIds }) {
  return { ...state, selected: applicationIds };
}

export default createReducer(initialState, {
  [APPLICATIONS_SELECTED_TOGGLE]: toggleFromSelectedApplications,
  [APPLICATIONS_SELECTED_SET]: setSelected,
});
