export const SSO_RESET = Symbol('SSO_RESET');
export const SSO_UPDATE = Symbol('SSO_UPDATE');
export const SSO_SIGN = Symbol('SSO_SIGN');
export const SSO_UNSIGN = Symbol('SSO_UNSIGN');

export const ssoReset = () => ({
  type: SSO_RESET,
});

export const ssoUpdate = (sso) => ({
  type: SSO_UPDATE,
  sso,
});

export const ssoSign = (accessToken) => ({
  type: SSO_SIGN,
  accessToken,
});

export const ssoUnsign = () => ({
  type: SSO_UNSIGN,
});
