import merge from '@misakey/helpers/merge';

export default function mergeEntities(state, { entities }) {
  return merge({}, state, { ...state.entities, ...entities });
}
