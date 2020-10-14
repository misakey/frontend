
import storage from '@misakey/helpers/storage';
import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';

export default (userStoreKey, url) => {
  const { csrf_token: csrfToken } = getSearchParams(url);
  if (isNil(csrfToken)) {
    // Handle app with no csrf token implemented
    return Promise.resolve(null);
  }
  const storageItem = storage.getItem(userStoreKey);
  if (!isNil(storageItem)) {
    const { profile, ...user } = JSON.parse(storageItem);
    const newUser = { ...user, profile: { ...profile, csrf_token: csrfToken } };
    storage.setItem(
      userStoreKey,
      JSON.stringify(newUser),
    );
    return Promise.resolve(newUser);
  }
  return Promise.resolve(null);
};
