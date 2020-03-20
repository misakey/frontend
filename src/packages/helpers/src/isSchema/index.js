import { schema } from 'normalizr';

export default (arg, type) => arg instanceof schema[type];
