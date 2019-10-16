import { updateProfile } from '@misakey/auth/store/actions/auth';


export const CONTACT_DATABOX_URL = 'CONTACT_DATABOX_URL';

export const contactDataboxURL = (databoxURL, mainDomain) => ({
  type: CONTACT_DATABOX_URL,
  databoxURL,
  mainDomain,
});

export const mailProviderPreferencyUpdate = (mailProvider) => updateProfile(
  { preferencies: { mailProvider } },
);
