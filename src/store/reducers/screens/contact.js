import { createSelector } from 'reselect';
import createAuthReducer from '@misakey/auth/store/reducers/helpers/createAuthReducer';

import {
  CONTACT_DATABOX_URL,
  CONTACT_DATABOX_URL_BY_ID,
  CLEAR_DATABOX_URL_BY_ID,
  SET_CONTACT_EMAIL,
} from 'store/actions/screens/contact';

import path from '@misakey/helpers/path';

// HELPERS
const pathParamMainDomain = path(['match', 'params', 'mainDomain']);
const pathMailProviderPreferency = path(['profile', 'preferencies', 'mailProvider']);

// INITIAL STATE
const initialState = { databoxURLs: {}, databoxURLsById: {}, contactEmail: null };


// SELECTORS
const getState = (state) => state.screens.contact;
const getMainDomainRouteParam = (state, props) => pathParamMainDomain(props);

const getDataboxURL = createSelector(
  getState,
  getMainDomainRouteParam,
  (state, mainDomain) => state.databoxURLs[mainDomain],
);

const getMailProviderPreferency = createSelector(
  (state) => state.auth,
  pathMailProviderPreferency,
);

export const selectors = {
  getDataboxURL,
  getMailProviderPreferency,
};

// REDUCER
const addDataboxURL = (state, { databoxURL, mainDomain }) => ({
  ...state,
  databoxURLs: { ...state.databoxURLs, [mainDomain]: databoxURL },
});

const addDataboxURLById = (state, { databoxURL, id, alreadyContacted }) => ({
  ...state,
  databoxURLsById: { ...state.databoxURLsById, [id]: { databoxURL, alreadyContacted } },
});

const clearDataboxURLById = (state) => ({
  ...state,
  databoxURLsById: {},
});

const setContactEmail = (state, { contactEmail }) => ({
  ...state,
  contactEmail,
});

export default createAuthReducer(initialState, {
  [CONTACT_DATABOX_URL]: addDataboxURL,
  [CONTACT_DATABOX_URL_BY_ID]: addDataboxURLById,
  [CLEAR_DATABOX_URL_BY_ID]: clearDataboxURLById,
  [SET_CONTACT_EMAIL]: setContactEmail,
});
