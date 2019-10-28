import isBoolean from '@misakey/helpers/isBoolean';

import createReducer from '@misakey/store/reducers/helpers/createReducer';
import {
  LAYOUT_APP_BAR_SHIFT,
  LAYOUT_APP_BAR_TOGGLE_SHIFT,
  LAYOUT_APP_BAR_UNSHIFT,

  LAYOUT_BURGER_SHOW,
  LAYOUT_BURGER_HIDE,
  LAYOUT_BURGER_TOGGLE,
  LAYOUT_BURGER_UPDATE,

  LAYOUT_BUTTON_CONNECT_SHOW,
  LAYOUT_BUTTON_CONNECT_HIDE,
  LAYOUT_BUTTON_CONNECT_TOGGLE,

  LAYOUT_APP_BAR_SHOW,
  LAYOUT_APP_BAR_HIDE,
  LAYOUT_APP_BAR_TOGGLE,

  LAYOUT_WARNING_DRAWER_SHOW,
  LAYOUT_WARNING_DRAWER_HIDE,
} from 'store/actions/Layout';

const initialState = {
  burger: false,
  burgerProps: { className: '' },
  buttonConnect: true,
  displayAppBar: true,
  displayWarningDrawer: false,
  shift: false,
};

function shift(state) {
  return { ...state, shift: true };
}
function unShift(state) {
  return { ...state, shift: false };
}
function toggleShift(state, { toggle }) {
  return { ...state, shift: toggle ? !!toggle : !state.shift };
}

function showBurger(state) {
  return { ...state, burger: true };
}
function hideBurger(state) {
  return { ...state, burger: false };
}
function toggleBurger(state, { toggle }) {
  return { ...state, burger: toggle ? !!toggle : !state.burger };
}
function updateBurger(state, { burger, burgerProps }) {
  return {
    ...state,
    burger: isBoolean(burger) ? burger : state.burger,
    burgerProps: {
      ...state.burgerProps,
      ...burgerProps,
    },
  };
}

function showButtonConnect(state) {
  return { ...state, buttonConnect: true };
}
function hideButtonConnect(state) {
  return { ...state, buttonConnect: false };
}
function toggleButtonConnect(state, { toggle }) {
  return { ...state, buttonConnect: toggle ? !!toggle : !state.buttonConnect };
}

function showAppBar(state) {
  return { ...state, displayAppBar: true };
}
function hideAppBar(state) {
  return { ...state, displayAppBar: false };
}
function toggleAppBar(state, { toggle }) {
  return { ...state, displayAppBar: toggle ? !!toggle : !state.displayAppBar };
}

function showWarningDrawer(state) {
  return { ...state, displayWarningDrawer: true };
}
function hideWarningDrawer(state) {
  return { ...state, displayWarningDrawer: false };
}

export default createReducer(initialState, {
  [LAYOUT_APP_BAR_SHIFT]: shift,
  [LAYOUT_APP_BAR_UNSHIFT]: unShift,
  [LAYOUT_APP_BAR_TOGGLE_SHIFT]: toggleShift,

  [LAYOUT_BURGER_SHOW]: showBurger,
  [LAYOUT_BURGER_HIDE]: hideBurger,
  [LAYOUT_BURGER_TOGGLE]: toggleBurger,
  [LAYOUT_BURGER_UPDATE]: updateBurger,

  [LAYOUT_BUTTON_CONNECT_SHOW]: showButtonConnect,
  [LAYOUT_BUTTON_CONNECT_HIDE]: hideButtonConnect,
  [LAYOUT_BUTTON_CONNECT_TOGGLE]: toggleButtonConnect,

  [LAYOUT_APP_BAR_SHOW]: showAppBar,
  [LAYOUT_APP_BAR_HIDE]: hideAppBar,
  [LAYOUT_APP_BAR_TOGGLE]: toggleAppBar,

  [LAYOUT_WARNING_DRAWER_SHOW]: showWarningDrawer,
  [LAYOUT_WARNING_DRAWER_HIDE]: hideWarningDrawer,
});
