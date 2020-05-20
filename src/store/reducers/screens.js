import { combineReducers } from 'redux';

import auth from './screens/auth';
import contact from './screens/contact';
import landing from './screens/landing';

export default combineReducers({
  // APP
  auth,
  contact,
  landing,
});
