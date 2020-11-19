import * as Sentry from '@sentry/browser';
import log from '@misakey/helpers/log';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';

export default (error, hint = 'AppError', tags = {}, level = 'error', extras = {}) => {
  execWithRequestIdleCallback(() => {
    const options = { tags, level, extra: { ...extras, hint } };
    Sentry.captureException(error, options);

    // log will only log in dev mode
    log(`Log error to Sentry with options ${JSON.stringify(options)}`);
    log(error, 'error', true);
  });
};
