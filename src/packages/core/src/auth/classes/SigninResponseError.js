const DEFAULT_ERROR = new Error('Unknown Error');

class SigninResponseError extends Error {
  constructor(error = DEFAULT_ERROR, state = null) {
    super(error);

    this.name = 'SigninResponseError';

    this.error = error;
    this.state = state;
  }
}

export default SigninResponseError;
