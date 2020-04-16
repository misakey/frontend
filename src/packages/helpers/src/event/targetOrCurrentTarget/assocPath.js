import hasTarget from '@misakey/helpers/event/hasTarget';
import assocPath from '@misakey/helpers/assocPath';

export default (subPath, value, event) => (hasTarget(event)
  ? assocPath(['target', ...subPath], value, event)
  : assocPath(['currentTarget', ...subPath], value, event)
);
