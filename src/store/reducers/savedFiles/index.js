import { normalize } from 'normalizr';
import { receiveEntities, removeEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import SavedFilesSchema from 'store/schemas/Files/Saved';
import { actionCreators } from 'store/reducers/savedFiles/pagination';
import { batch } from 'react-redux';

const { addPaginatedId, removePaginatedId } = actionCreators;

export const addSavedFile = (identityId, file) => (dispatch) => {
  const { entities } = normalize(file, SavedFilesSchema.entity);

  return batch(() => {
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    dispatch(addPaginatedId(identityId, file.id));
  });
};

export const deleteSavedFile = (identityId, fileId) => (dispatch) => batch(() => {
  dispatch(removeEntities([fileId], SavedFilesSchema));
  dispatch(removePaginatedId(identityId, fileId));
});
