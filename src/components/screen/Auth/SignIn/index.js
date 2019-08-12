import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { getSignInHref } from '@misakey/api/endpoints/auth/helpers';
import { SIGN_IN_STATE_LENGTH } from 'constants/auth';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import isEmpty from '@misakey/helpers/isEmpty';

import './SignIn.scss';

const AuthSignIn = ({ buttonProps, title, t }) => (
  <div id="AuthSignIn">
    <Typography variant="h5" component="h3" align="center" color="textSecondary">
      {isEmpty(title) ? t('auth:signIn.title') : title}
    </Typography>
    <Button href={getSignInHref(SIGN_IN_STATE_LENGTH)} rel="noopener noreferrer" {...buttonProps}>
      {t('auth:signIn.button.label')}
    </Button>
  </div>
);

AuthSignIn.propTypes = {
  buttonProps: PropTypes.shape({ label: PropTypes.isRequired }),
  title: PropTypes.string,
  t: PropTypes.func.isRequired,
};

AuthSignIn.defaultProps = {
  buttonProps: { color: 'secondary', variant: 'contained' },
  title: '',
};

export default withTranslation('auth')(AuthSignIn);
