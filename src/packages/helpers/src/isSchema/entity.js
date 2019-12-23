import { schema } from 'normalizr';

export default (arg) => arg instanceof schema.Entity;
