export const SCREEN_SERVICE_DRAWER_OPEN = Symbol('SCREEN_SERVICE_DRAWER_OPEN');
export const SCREEN_SERVICE_DRAWER_CLOSE = Symbol('SCREEN_SERVICE_DRAWER_CLOSE');
export const SCREEN_SERVICE_DRAWER_TOGGLE = Symbol('SCREEN_SERVICE_DRAWER_TOGGLE');

export const screenServiceDrawerOpen = () => ({
  type: SCREEN_SERVICE_DRAWER_OPEN,
});
export const screenServiceDrawerClose = () => ({
  type: SCREEN_SERVICE_DRAWER_CLOSE,
});
export const screenServiceDrawerToggle = (toggle) => ({
  type: SCREEN_SERVICE_DRAWER_TOGGLE,
  toggle,
});
