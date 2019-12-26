export const AUTH_SECLEVEL_WARNING_SHOW = Symbol('AUTH_SECLEVEL_WARNING_SHOW');
export const AUTH_SECLEVEL_WARNING_HIDE = Symbol('AUTH_SECLEVEL_WARNING_HIDE');

export const authSeclevelWarningShow = (requiredSeclevel) => ({
  type: AUTH_SECLEVEL_WARNING_SHOW,
  requiredSeclevel,
});

export const authSeclevelWarningHide = () => ({
  type: AUTH_SECLEVEL_WARNING_HIDE,
});
