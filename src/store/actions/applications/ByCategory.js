
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import ApplicationsByCategorySchema from 'store/schemas/ApplicationsByCategory';

export const receiveApplicationsByCategories = (applicationsByCategories) => (dispatch) => {
  const normalized = normalize(applicationsByCategories, ApplicationsByCategorySchema.entity);
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities)));
};
