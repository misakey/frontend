import isFunction from '@misakey/helpers/isFunction';

import { useCallback } from 'react';

export default (condition, onClick, onCondition) => useCallback(
  (...args) => {
    if (condition) {
      onCondition(...args);
    } else if (isFunction(onClick)) {
      onClick(...args);
    }
  },
  [condition, onClick, onCondition],
);
