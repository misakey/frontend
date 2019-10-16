import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import routes from 'routes';
import isEmpty from '@misakey/helpers/isEmpty';

import SignUpConfirm from 'components/smart/Auth/SignUp/Confirm';

function AuthSignUpConfirm({ email, password, challenge }) {
  if (isEmpty(email)) { return <Redirect to={routes.auth.signUp._} />; }

  return <SignUpConfirm displayCard initialValues={{ email, password, challenge }} />;
}

AuthSignUpConfirm.propTypes = {
  email: PropTypes.string,
  password: PropTypes.string,
  challenge: PropTypes.string,
};

AuthSignUpConfirm.defaultProps = {
  email: '',
  password: '',
  challenge: '',
};

export default connect((state) => ({
  email: state.screens.auth.email,
  password: state.screens.auth.password,
  challenge: state.sso.loginChallenge,
}))(AuthSignUpConfirm);
