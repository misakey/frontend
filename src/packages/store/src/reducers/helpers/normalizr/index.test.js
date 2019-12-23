import { schema } from 'normalizr';
import { denormalize } from './index';

describe('testing store helper normalizr', () => {
  describe('denormalize', () => {
    const toto = 'toto';
    const foo = 'foo';
    const id = 5555;
    const entity = { id, hey: 'iamfoo' };
    const entities = {
      [foo]: { [id]: entity },
    };
    it('should not throw error if entity schema key is not in state', () => {
      const entitySchema = new schema.Entity(toto, {});
      expect(denormalize(id, entitySchema, entities)).toBeNull();
    });

    it('should return entity if entity schema key is in state', () => {
      const entitySchema = new schema.Entity(foo, {});
      expect(denormalize(id, entitySchema, entities)).toEqual(entity);
    });
  });
});
