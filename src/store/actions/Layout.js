export const LAYOUT_APP_BAR_SHIFT = Symbol('LAYOUT_APP_BAR_SHIFT');
export const LAYOUT_APP_BAR_UNSHIFT = Symbol('LAYOUT_APP_BAR_UNSHIFT');
export const LAYOUT_APP_BAR_TOGGLE_SHIFT = Symbol('LAYOUT_APP_BAR_TOGGLE_SHIFT');

export const layoutAppBarShift = () => ({
  type: LAYOUT_APP_BAR_SHIFT,
});
export const layoutAppBarUnshift = () => ({
  type: LAYOUT_APP_BAR_UNSHIFT,
});
export const layoutAppBarToggleShift = toggle => ({
  type: LAYOUT_APP_BAR_TOGGLE_SHIFT,
  toggle,
});

export const LAYOUT_BURGER_SHOW = Symbol('LAYOUT_BURGER_SHOW');
export const LAYOUT_BURGER_HIDE = Symbol('LAYOUT_BURGER_HIDE');
export const LAYOUT_BURGER_TOGGLE = Symbol('LAYOUT_BURGER_TOGGLE');
export const LAYOUT_BURGER_UPDATE = Symbol('LAYOUT_BURGER_UPDATE');
export const LAYOUT_BURGER_CLICKED = Symbol('LAYOUT_BURGER_CLICKED');

export const layoutBurgerShow = () => ({
  type: LAYOUT_BURGER_SHOW,
});
export const layoutBurgerHide = () => ({
  type: LAYOUT_BURGER_HIDE,
});
export const layoutBurgerToggle = toggle => ({
  type: LAYOUT_BURGER_TOGGLE,
  toggle,
});
export const layoutBurgerUpdate = burgerProps => ({
  type: LAYOUT_BURGER_UPDATE,
  burgerProps,
});
export const layoutBurgerClicked = () => ({
  type: LAYOUT_BURGER_CLICKED,
});

export const LAYOUT_GO_BACK_SHOW = Symbol('LAYOUT_GO_BACK_SHOW');
export const LAYOUT_GO_BACK_HIDE = Symbol('LAYOUT_GO_BACK_HIDE');
export const LAYOUT_GO_BACK_TOGGLE = Symbol('LAYOUT_GO_BACK_TOGGLE');

export const layoutGoBackShow = () => ({
  type: LAYOUT_GO_BACK_SHOW,
});
export const layoutGoBackHide = () => ({
  type: LAYOUT_GO_BACK_HIDE,
});
export const layoutGoBackToggle = toggle => ({
  type: LAYOUT_GO_BACK_TOGGLE,
  toggle,
});

export const LAYOUT_BUTTON_CONNECT_SHOW = Symbol('LAYOUT_BUTTON_CONNECT_SHOW');
export const LAYOUT_BUTTON_CONNECT_HIDE = Symbol('LAYOUT_BUTTON_CONNECT_HIDE');
export const LAYOUT_BUTTON_CONNECT_TOGGLE = Symbol('LAYOUT_BUTTON_CONNECT_TOGGLE');

export const layoutButtonConnectShow = () => ({
  type: LAYOUT_BUTTON_CONNECT_SHOW,
});
export const layoutButtonConnectHide = () => ({
  type: LAYOUT_BUTTON_CONNECT_HIDE,
});
export const layoutButtonConnectToggle = toggle => ({
  type: LAYOUT_BUTTON_CONNECT_TOGGLE,
  toggle,
});
