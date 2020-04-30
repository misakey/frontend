
// ACTIONS
export const SENDING = 'sending';
export const ANSWERING = 'answering';
export const REOPENING = 'reopening';
export const TERMINATING = 'terminating';
export const UPLOADING = 'uploading';
export const ACCEPTING = 'accepting';

// FRONTEND only
export const CONFIRM_EMAIL = 'confirm_email';

// METADATA FOR ACTIONS
export const METADATA = {
  [SENDING]: null,
  [ANSWERING]: ['dpoComment'],
  [REOPENING]: null,
  [TERMINATING]: ['ownerComment'],
  [ACCEPTING]: null,
  [UPLOADING]: ['blobId'],
};

// AUTHOR ROLES
export const DPO = 'dpo';
export const OWNER = 'owner';
export const MISAKEY = 'misakey';
