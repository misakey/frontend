import { denormalize as normalizrDenormalize } from 'normalizr';

import hasPath from '@misakey/helpers/hasPath';

export const denormalize = (identifier, entitySchema, entities) => {
  const { key } = entitySchema;
  if (hasPath([key, identifier], entities)) {
    return normalizrDenormalize(identifier, entitySchema, entities);
  }
  return null;
};
