import { updateProfile } from '@misakey/auth/store/actions/auth';


export const CONTACT_DATABOX_URL = Symbol('CONTACT_DATABOX_URL');
export const CONTACT_DATABOX_URL_BY_ID = Symbol('CONTACT_DATABOX_URL_BY_ID');
export const CLEAR_DATABOX_URL_BY_ID = Symbol('CLEAR_DATABOX_URL_BY_ID');
export const SET_CONTACT_EMAIL = Symbol('SET_CONTACT_EMAIL');

export const contactDataboxURL = (databoxURL, mainDomain) => ({
  type: CONTACT_DATABOX_URL,
  databoxURL,
  mainDomain,
});

export const mailProviderPreferencyUpdate = (mailProvider) => updateProfile(
  { preferencies: { mailProvider } },
);

export const contactDataboxURLById = (databoxURL, id, alreadyContacted = false) => ({
  type: CONTACT_DATABOX_URL_BY_ID,
  databoxURL,
  id,
  alreadyContacted,
});

export const clearDataboxURLById = () => ({
  type: CLEAR_DATABOX_URL_BY_ID,
});

export const setContactEmail = (contactEmail) => ({
  type: SET_CONTACT_EMAIL,
  contactEmail,
});
