const DEFAULT_ERROR = new Error('Unknown Error');

class SigninResponseError extends Error {
  constructor(error = DEFAULT_ERROR, referrer = null) {
    super(error);

    this.name = 'SigninResponseError';

    this.error = error;
    this.referrer = referrer;
  }
}

export default SigninResponseError;
