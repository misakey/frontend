import { useMemo } from 'react';

export default (modifier, obj) => useMemo(
  () => modifier(obj),
  [modifier, obj],
);
