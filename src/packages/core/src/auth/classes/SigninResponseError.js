const DEFAULT_ERROR = new Error('Unknown Error');

class SigninResponseError extends Error {
  constructor(error = DEFAULT_ERROR, callbackHints = {}) {
    super(error);

    this.name = 'SigninResponseError';

    this.error = error;
    this.callbackHints = callbackHints;
  }
}

export default SigninResponseError;
