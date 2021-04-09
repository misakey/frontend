export const SSO_RESET = Symbol('SSO_RESET');
export const SSO_UPDATE = Symbol('SSO_UPDATE');
export const SSO_IDENTITY_RESET = Symbol('SSO_IDENTITY_RESET');
export const SSO_SET_IDENTIFIER = Symbol('SSO_SET_IDENTIFIER');
export const SSO_SET_METHOD_NAME = Symbol('SSO_SET_METHOD_NAME');
export const SSO_SET_METHOD_METADATA = Symbol('SSO_SET_METHOD_METADATA');

export const ssoReset = () => ({
  type: SSO_RESET,
});

export const ssoUpdate = (sso) => ({
  type: SSO_UPDATE,
  sso,
});

export const onSetIdentifier = (identifier) => ({
  type: SSO_SET_IDENTIFIER,
  identifier,
});

export const ssoSetMethodName = (methodName) => ({
  type: SSO_SET_METHOD_NAME,
  methodName,
});

export const ssoSetMethodMetadata = (methodName, metadata) => ({
  type: SSO_SET_METHOD_METADATA,
  methodName,
  metadata,
});

export const onResetSsoIdentity = () => ({
  type: SSO_IDENTITY_RESET,
});
