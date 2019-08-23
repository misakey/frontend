import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { LAYOUT_BURGER_CLICKED } from 'store/actions/Layout';
import {
  SCREEN_SERVICE_DRAWER_OPEN,
  SCREEN_SERVICE_DRAWER_CLOSE,
  SCREEN_SERVICE_DRAWER_TOGGLE,
} from 'store/actions/screens/Service/Drawer';

const initialState = {
  open: false,
};

function drawerOpen(state) {
  return { ...state, open: true };
}
function drawerClose(state) {
  return { ...state, open: false };
}
function drawerToggle(state, { toggle }) {
  return { ...state, open: toggle ? !!toggle : !state.open };
}

export default createReducer(initialState, {
  [SCREEN_SERVICE_DRAWER_OPEN]: drawerOpen,
  [SCREEN_SERVICE_DRAWER_CLOSE]: drawerClose,
  [SCREEN_SERVICE_DRAWER_TOGGLE]: drawerToggle,
  [LAYOUT_BURGER_CLICKED]: drawerToggle,
});
