import { createSelector } from 'reselect';
import { denormalize, normalize } from 'normalizr';
import { batch } from 'react-redux';
import { receiveEntities, removeEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import SavedFilesSchema from 'store/schemas/Files/Saved';
import { actionCreators, selectors } from 'store/reducers/files/saved/pagination';
import isNil from '@misakey/core/helpers/isNil';

// CONSTANTS
const { addPaginatedId, removePaginatedId, receivePaginatedIds } = actionCreators;
const { makeGetItemCount } = selectors;

// HELPERS
const getSavedFileForNormalization = (savedFile) => {
  const { createdAt, encryptedFileId } = savedFile;
  const decryptedFile = {
    id: encryptedFileId,
    isSaved: true,
    sender: { isFromCurrentUser: true },
    createdAt,
  };
  return { ...savedFile, decryptedFile };
};

// SELECTORS
export const makeDenormalizeSavedFileSelector = () => createSelector(
  (state) => state.entities,
  (_, fileId) => fileId,
  (entities, id) => (isNil(id) ? null : denormalize(id, SavedFilesSchema.entity, entities)),
);


// THUNKS
export const receiveSavedFiles = (data, identityId, offset, limit) => (dispatch) => {
  const normalized = normalize(
    data.map(getSavedFileForNormalization),
    SavedFilesSchema.collection,
  );
  const { entities, result } = normalized;
  return batch(() => {
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    dispatch(receivePaginatedIds(identityId, offset, limit, result));
  });
};

export const addSavedFile = (identityId, file) => (dispatch, getState) => {
  const getFileItemCount = makeGetItemCount();
  const { entities } = normalize(getSavedFileForNormalization(file), SavedFilesSchema.entity);
  const itemCount = getFileItemCount(getState(), identityId);

  // No need to add if saved files have not been fetched yet
  if (isNil(itemCount)) {
    return null;
  }

  return batch(() => {
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    dispatch(addPaginatedId(identityId, file.id));
  });
};

export const deleteSavedFile = (identityId, fileId) => (dispatch) => batch(() => {
  dispatch(removeEntities([fileId], SavedFilesSchema));
  dispatch(removePaginatedId(identityId, fileId));
});
