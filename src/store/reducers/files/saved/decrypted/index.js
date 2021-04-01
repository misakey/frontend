
import { createSelector } from 'reselect';
import { denormalize } from 'normalizr';
import propOr from '@misakey/core/helpers/propOr';
import isNil from '@misakey/core/helpers/isNil';
import { removeEntities } from 'packages/store/src/actions/entities';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

// SELECTORS
export const makeDenormalizeFileSelector = () => createSelector(
  (state) => state.entities,
  (_, fileId) => fileId,
  (entities, id) => (isNil(id) ? null : denormalize(id, DecryptedFileSchema.entity, entities)),
);

const getDecryptedFileSelector = createSelector(
  (state) => state.entities.decryptedFiles,
  (items) => (id) => propOr(null, id)(items),
);

export const getDecryptedFile = (state, id) => getDecryptedFileSelector(state)(id);

// THUNKS
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
