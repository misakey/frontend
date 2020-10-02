import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';

import * as Sentry from '@sentry/browser';

// CONSTANTS
const FLOOD_MANAGEMENT_METHODS = ['GET', 'HEAD'];

// HELPERS
const makeRequestId = ({ requestUri, method }) => `${method}:${requestUri}`;

const getRequestMethod = path(['init', 'method']);


export default (delay) => {
  // keep a store only for this floodManagementAlert delay
  let floodManagementStore = {};
  let floodManagementToken;

  return (request, endpoint) => {
    const match = !(request instanceof Response)
      && !(request instanceof Error)
      && FLOOD_MANAGEMENT_METHODS.includes(getRequestMethod(request));

    if (match) {
      const { token } = endpoint;
      if (floodManagementToken !== token) {
        if (!isNil(floodManagementToken)) {
          floodManagementStore = {};
        }
        floodManagementToken = token;
      }
      const requestId = makeRequestId(endpoint);

      const timestamp = prop(requestId, floodManagementStore);

      if (!isNil(timestamp) && delay > (Date.now() - timestamp)) {
        const errorMessage = `[flood alert]: ${requestId} fired in less than ${delay}ms`;
        Sentry.captureMessage(errorMessage, 'error');
        log(errorMessage, 'error');
      }

      floodManagementStore[requestId] = Date.now();
    }
  };
};
