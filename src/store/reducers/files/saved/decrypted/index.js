
import { createSelector } from 'reselect';
import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';
import { removeEntities } from 'packages/store/src/actions/entities';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

const getDecryptedFileSelector = createSelector(
  (state) => state.entities.decryptedFiles,
  (items) => (id) => propOr(null, id)(items),
);

export const getDecryptedFile = (state, id) => getDecryptedFileSelector(state)(id);

export const cleanDecryptedFile = (id) => (dispatch, getState) => {
  const decryptedFile = getDecryptedFile(getState(), id);
  if (!isNil(decryptedFile)) {
    const { isSaved } = decryptedFile;
    if (!isSaved) {
      return Promise.resolve(dispatch(removeEntities([{ id }], DecryptedFileSchema)));
    }
  }
  return Promise.resolve();
};
