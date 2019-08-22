import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import isEmpty from '@misakey/helpers/isEmpty';

import './SignIn.scss';
import ButtonConnect from 'components/dumb/Button/Connect';

const AuthSignIn = ({ buttonProps, title, t }) => (
  <div id="AuthSignIn">
    <Typography variant="h5" component="h3" align="center" color="textSecondary">
      {isEmpty(title) ? t('auth:signIn.title') : title}
    </Typography>
    <ButtonConnect {...buttonProps} />
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
