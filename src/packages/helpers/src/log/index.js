const log = (message, level = 'log', env = 'development') => {
  if (process && process.env.NODE_ENV === env) {
    // eslint-disable-next-line no-console
    console[level](message);
  }
};

export default log;
