import { useMemo } from 'react';

// CONSTANTS
const EMPTY_OBJ = {};

export default (obj) => useMemo(
  () => obj || EMPTY_OBJ,
  [obj],
);
