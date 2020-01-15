import { updateProfile } from '@misakey/auth/store/actions/auth';


export const CONTACT_DATABOX_URL = 'CONTACT_DATABOX_URL';
export const CONTACT_DATABOX_URL_BY_ID = 'CONTACT_DATABOX_URL_BY_ID';
export const CLEAR_DATABOX_URL_BY_ID = 'CLEAR_DATABOX_URL_BY_ID';

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
