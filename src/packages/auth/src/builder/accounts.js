import API from '@misakey/api';

export const fetchPwdHashParams = (accountId) => API
  .use(API.endpoints.accounts.passwordParams.read)
  .build({ id: accountId })
  .send();
