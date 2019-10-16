export const ACCESS_REQUEST_RESET = 'ACCESS_REQUEST_RESET';
export const ACCESS_REQUEST_UPDATE = 'ACCESS_REQUEST_UPDATE';

export const accessRequestReset = () => ({
  type: ACCESS_REQUEST_RESET,
});

export const accessRequestUpdate = props => ({
  type: ACCESS_REQUEST_UPDATE,
  ...props,
});
