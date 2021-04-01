import API from '@misakey/core/api';

export const getEncryptedFileBuilder = (encryptedFileId) => API
  .use(API.endpoints.files.encryptedFiles.read)
  .build({ id: encryptedFileId })
  .send();
