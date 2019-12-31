export const AUTH_SECLEVEL_WARNING_SHOW = Symbol('AUTH_SECLEVEL_WARNING_SHOW');
export const AUTH_SECLEVEL_WARNING_HIDE = Symbol('AUTH_SECLEVEL_WARNING_HIDE');

export const authSeclevelWarningShow = (requiredSeclevel) => ({
  type: AUTH_SECLEVEL_WARNING_SHOW,
  requiredSeclevel,
});

export const authSeclevelWarningHide = () => ({
  type: AUTH_SECLEVEL_WARNING_HIDE,
});


export const PLUGIN_REFRESH_WARNING_SHOW = Symbol('PLUGIN_REFRESH_WARNING_SHOW');
export const PLUGIN_REFRESH_WARNING_HIDE = Symbol('PLUGIN_REFRESH_WARNING_HIDE');

export const pluginRefreshWarningShow = () => ({
  type: PLUGIN_REFRESH_WARNING_SHOW,
});

export const pluginRefreshWarningHide = () => ({
  type: PLUGIN_REFRESH_WARNING_HIDE,
});
