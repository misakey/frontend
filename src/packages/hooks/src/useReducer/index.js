import useReducerLogger from '@misakey/hooks/useReducerLogger';
import { useReducer } from 'react';

export default (reducer) => {
  const loggedReducer = useReducerLogger(reducer);
  return useReducer(loggedReducer);
};
