import React, { forwardRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import { signIn, signOut } from 'store/actions/auth';

import ButtonConnect from '@misakey/ui/Button/Connect';

// CONSTANTS
const ACCOUNT_HREF = `${window.env.FRONTEND_ENDPOINT}/account`;

// COMPONENTS

// eslint-disable-next-line jsx-a11y/anchor-has-content
const AccountLink = forwardRef((props, ref) => <a ref={ref} href={ACCOUNT_HREF} {...props} />);

const Wrapper = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  return <ButtonConnect {...props} application="admin" enqueueSnackbar={enqueueSnackbar} AccountLink={AccountLink} />;
};

// CONNECT
const mapStateToProps = state => ({
  id: state.auth.id,
  token: state.auth.token,
  profile: state.auth.profile,
});
const mapDispatchToProps = dispatch => ({
  onSignOut: () => dispatch(signOut()),
  onSignIn: profile => dispatch(signIn({ profile })),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withTranslation(['connect', 'error'])(Wrapper)));
