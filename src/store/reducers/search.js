import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';

import {
  RECEIVE_APPLICATIONS_LINKED_IDS,
  RECEIVE_APPLICATIONS_SUGGESTED_IDS,
} from 'store/actions/search';

const initialState = { linkedIds: [], suggestedIds: [] };


const applicationsLinkedIds = (state, { linkedIds }) => ({
  ...state,
  linkedIds,
});

const applicationsSuggestedIds = (state, { suggestedIds }) => ({
  ...state,
  suggestedIds,
});


export default createResetOnSignOutReducer(initialState, {
  [RECEIVE_APPLICATIONS_LINKED_IDS]: applicationsLinkedIds,
  [RECEIVE_APPLICATIONS_SUGGESTED_IDS]: applicationsSuggestedIds,
});
