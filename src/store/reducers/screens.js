import { combineReducers } from 'redux';

import Service from './screens/Service';
import ServiceDrawer from './screens/Service/Drawer';
import ServiceHome from './screens/Service/Home';

export default combineReducers({
  Service,
  ServiceDrawer,
  ServiceHome,
});
