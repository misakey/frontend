import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DEFAULT_VALUES from 'components/smart/Auth/SignIn/values.json';

import SignInComponent from 'components/smart/Auth/SignIn';

function AuthSignIn({ challenge, identifier }) {
  return (
    <SignInComponent
      displayCard
      challenge={challenge}
      initialValues={{ ...DEFAULT_VALUES, identifier }}
    />
  );
}

AuthSignIn.propTypes = {
  challenge: PropTypes.string.isRequired,
  identifier: PropTypes.string,
};

AuthSignIn.defaultProps = {
  identifier: '',
};

export default connect((state) => ({ identifier: state.screens.auth.identifier }))(AuthSignIn);
