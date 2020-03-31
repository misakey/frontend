import { combineReducers } from 'redux';

import auth from './screens/auth';
import contact from './screens/contact';
import landing from './screens/landing';
import allRequestIds from './screens/allRequestIds';

import Service from './screens/Service';
import ServiceDrawer from './screens/Service/Drawer';
import ServiceHome from './screens/Service/Home';

export default combineReducers({
  // APP
  auth,
  contact,
  landing,
  allRequestIds,

  // ADMIN
  Service,
  ServiceDrawer,
  ServiceHome,
});
