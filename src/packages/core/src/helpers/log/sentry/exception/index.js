import * as Sentry from '@sentry/browser';
import log from '@misakey/core/helpers/log';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import execWithRequestIdleCallback from '@misakey/core/helpers/execWithRequestIdleCallback';

// HELPERS
const convertSentryLogLevel = (level) => {
  if (level === 'warning') {
    return 'warn';
  }
  return level;
};

export default (error, hint = 'AppError', tags = {}, level = 'error', extras = {}) => {
  execWithRequestIdleCallback(() => {
    if (isFunction(Sentry.getCurrentHub) && !isNil(Sentry.getCurrentHub().getClient())) {
      const options = { tags, level, extra: { ...extras, hint } };
      Sentry.captureException(error, options);
      // log will only log in dev mode
      log(`Log error to Sentry with options ${JSON.stringify(options)}`);
    }
    log(error, convertSentryLogLevel(level), /* env = */'development', /* trace = */true);
  });
};
