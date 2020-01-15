import moment from 'moment';
import pullAll from 'lodash/pullAll';
import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  APPLICATIONS_IDS_ADD,
  APPLICATIONS_IDS_REMOVE,
  APPLICATIONS_IDS_OVERRIDE,
  APPLICATIONS_RESET,
  APPLICATIONS_SELECTED_TOGGLE,
  APPLICATIONS_SELECTED_SET,
} from 'store/actions/screens/applications';

const initialState = { ids: [], updatedAt: null, boxes: [], selected: [] };

function addIds(state, { ids }) {
  return { ...state, ids: [...state.ids, ids], updatedAt: moment().toISOString() };
}

function removeIds(state, { ids }) {
  return { ...state, ids: pullAll([...state.ids], ids), updatedAt: moment().toISOString() };
}

function overrideIds(state, { ids }) {
  return { ...state, ids, updatedAt: moment().toISOString() };
}

function reset(state) {
  return { ...state, ...initialState };
}

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
  [APPLICATIONS_IDS_ADD]: addIds,
  [APPLICATIONS_IDS_REMOVE]: removeIds,
  [APPLICATIONS_IDS_OVERRIDE]: overrideIds,
  [APPLICATIONS_RESET]: reset,
  [APPLICATIONS_SELECTED_TOGGLE]: toggleFromSelectedApplications,
  [APPLICATIONS_SELECTED_SET]: setSelected,
});
