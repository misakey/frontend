import moment from 'moment';
import pullAll from 'lodash/pullAll';
import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  APPLICATIONS_IDS_ADD,
  APPLICATIONS_IDS_REMOVE,
  APPLICATIONS_IDS_OVERRIDE,
  APPLICATIONS_BOXES_ADD,
  APPLICATIONS_RESET,
} from 'store/actions/screens/applications';

const initialState = { ids: [], updatedAt: null, boxes: [] };

function addIds(state, { ids }) {
  return { ...state, ids: [...state.ids, ids], updatedAt: moment().toISOString() };
}

function removeIds(state, { ids }) {
  return { ...state, ids: pullAll([...state.ids], ids), updatedAt: moment().toISOString() };
}

function overrideIds(state, { ids }) {
  return { ...state, ids, updatedAt: moment().toISOString() };
}

function addBoxes(state, { boxes }) {
  return { ...state, boxes: [...state.boxes, ...boxes], updatedAt: moment().toISOString() };
}

function reset(state) {
  return { ...state, ...initialState };
}

export default createReducer(initialState, {
  [APPLICATIONS_IDS_ADD]: addIds,
  [APPLICATIONS_IDS_REMOVE]: removeIds,
  [APPLICATIONS_IDS_OVERRIDE]: overrideIds,
  [APPLICATIONS_BOXES_ADD]: addBoxes,
  [APPLICATIONS_RESET]: reset,
});
