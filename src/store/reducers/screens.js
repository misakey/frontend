import { combineReducers } from 'redux';

import service from './screens/service';
import serviceDetails from './screens/service/details';

export default combineReducers({
  service,
  serviceDetails,
});
