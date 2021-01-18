class SigninResponseError extends Error {
  constructor({ error, referrer } = {}) {
    super(error);

    this.name = 'SigninResponseError';

    this.error = error;
    this.referrer = referrer;
  }
}

export default SigninResponseError;
