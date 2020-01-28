export const SSO_RESET = Symbol('SSO_RESET');
export const SSO_UPDATE = Symbol('SSO_UPDATE');

export const ssoReset = () => ({
  type: SSO_RESET,
});

export const ssoUpdate = (params) => ({
  type: SSO_UPDATE,
  ...params,
});
