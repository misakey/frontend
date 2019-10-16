export const SCREEN_SERVICE_RESET = 'SCREEN_SERVICE_RESET';
export const SCREEN_SERVICE_UPDATE = 'SCREEN_SERVICE_UPDATE';

export const screenServiceReset = () => ({
  type: SCREEN_SERVICE_RESET,
});

export const screenServiceUpdate = (props) => ({
  type: SCREEN_SERVICE_UPDATE,
  ...props,
});
