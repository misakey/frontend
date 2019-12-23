import { createSelector } from 'reselect';
import createAuthReducer from 'store/reducers/helpers/createAuthReducer';

import {
  CONTACT_DATABOX_URL,
} from 'store/actions/screens/contact';

import path from '@misakey/helpers/path';

// HELPERS
const pathParamMainDomain = path(['match', 'params', 'mainDomain']);
const pathMailProviderPreferency = path(['profile', 'preferencies', 'mailProvider']);

// INITIAL STATE
const initialState = { databoxURLs: {} };


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

export default createAuthReducer(initialState, {
  [CONTACT_DATABOX_URL]: addDataboxURL,
});
