import { combineReducers } from 'redux';

import applications from './screens/applications';
import auth from './screens/auth';
import contact from './screens/contact';
import landing from './screens/landing';
import thirdparty from './screens/thirdparty';

import Service from './screens/Service';
import ServiceDrawer from './screens/Service/Drawer';
import ServiceHome from './screens/Service/Home';

export default combineReducers({
  // APP
  applications,
  auth,
  contact,
  landing,
  thirdparty,

  // ADMIN
  Service,
  ServiceDrawer,
  ServiceHome,
});
