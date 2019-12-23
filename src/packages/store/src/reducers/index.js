import { combineReducers } from 'redux';
import entities from './entities';
import global from './global';

const reducers = {
  entities,
  global,
};

export default reducers;

export const combineWithReducers = (extraReducers = {}) => combineReducers({
  ...reducers,
  ...extraReducers,
});
