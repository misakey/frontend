export const ACCESS_TOKEN_RESET = 'ACCESS_TOKEN_RESET';
export const ACCESS_TOKEN_UPDATE = 'ACCESS_TOKEN_UPDATE';

export const accessTokenReset = () => ({
  type: ACCESS_TOKEN_RESET,
});

export const accessTokenUpdate = (props) => ({
  type: ACCESS_TOKEN_UPDATE,
  ...props,
});
