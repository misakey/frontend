import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import isEmpty from '@misakey/helpers/isEmpty';

import './SignIn.scss';
import ButtonConnect from 'components/dumb/Button/Connect';

const BoxSignIn = ({ buttonProps, title, t }) => (
  <div id="BoxSignIn">
    <Typography variant="h5" component="h3" align="center" color="textSecondary">
      {isEmpty(title) ? t('auth:signIn.title') : title}
    </Typography>
    <ButtonConnect {...buttonProps} />
  </div>
);

BoxSignIn.propTypes = {
  buttonProps: PropTypes.shape({ label: PropTypes.isRequired }),
  title: PropTypes.string,
  t: PropTypes.func.isRequired,
};

BoxSignIn.defaultProps = {
  buttonProps: { color: 'secondary', variant: 'contained' },
  title: '',
};

export default withTranslation('auth')(BoxSignIn);
