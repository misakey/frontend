import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DEFAULT_VALUES from 'components/smart/Auth/SignIn/values';

import SignInComponent from 'components/smart/Auth/SignIn';

function AuthSignIn({ challenge, email }) {
  return (
    <SignInComponent
      displayCard
      challenge={challenge}
      initialValues={{ ...DEFAULT_VALUES, email }}
    />
  );
}

AuthSignIn.propTypes = {
  challenge: PropTypes.string.isRequired,
  email: PropTypes.string,
};

AuthSignIn.defaultProps = {
  email: '',
};

export default connect((state) => ({ ...state.screens.auth }))(AuthSignIn);
