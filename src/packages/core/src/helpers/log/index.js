const log = (message, level = 'log', env = 'development', trace = false) => {
  if (process && process.env.NODE_ENV === env) {
    // eslint-disable-next-line no-console
    console[level](message);
    if (trace) {
    // eslint-disable-next-line no-console
      console.trace();
    }
  }
};

export default log;
