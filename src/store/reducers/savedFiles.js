import SavedFilesByIdentitySchema from 'store/schemas/Files/Saved/ByIdentity';
import { denormalize, normalize } from 'normalizr';
import { createSelector } from 'reselect';
import { receiveEntities, updateEntities, removeEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import SavedFilesSchema from 'store/schemas/Files/Saved';

export const makeGetSavedFilesByIdentitySelector = () => createSelector(
  (state) => state.entities,
  (_, identityId) => identityId,
  (entities, identityId) => {
    const { savedFiles } = denormalize(
      identityId,
      SavedFilesByIdentitySchema.entity,
      entities,
    ) || {};
    return savedFiles;
  },
);


export const addSavedFiles = (identityId, files) => (dispatch, getState) => {
  const getSavedFilesForIdentity = makeGetSavedFilesByIdentitySelector();
  const currentSavedFiles = getSavedFilesForIdentity(getState(), identityId);

  const { entities, result } = normalize(files, SavedFilesSchema.collection);

  const changes = {
    savedFiles: [...new Set(result.concat(currentSavedFiles || []))],
  };

  return Promise.resolve(
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
  ).then(() => {
    dispatch(updateEntities([{ id: identityId, changes }], SavedFilesByIdentitySchema));
  });
};

export const deleteSavedFiles = (identityId, fileIds) => (dispatch, getState) => {
  const getSavedFilesForIdentity = makeGetSavedFilesByIdentitySelector();
  const currentSavedFiles = getSavedFilesForIdentity(getState(), identityId);

  const changes = {
    savedFiles: currentSavedFiles.filter(({ id }) => !fileIds.includes(id)),
  };
  return Promise.resolve(
    dispatch(updateEntities([{ id: identityId, changes }], SavedFilesByIdentitySchema)),
  ).then(() => {
    dispatch(removeEntities(fileIds.map((id) => ({ id })), SavedFilesSchema));
  });
};
