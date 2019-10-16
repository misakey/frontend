import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import routes from 'routes';

const SignUpFormActions = ({ isSubmitting, isValid, t }) => (
  <Grid container direction="row" justify="space-between" alignItems="flex-start">
    <Button to={routes.auth.signIn} component={Link} color="secondary">
      {t('auth:signUp.form.action.signIn')}
    </Button>
    <Button
      variant="contained"
      color="secondary"
      type="submit"
      disabled={isSubmitting || !isValid}
    >
      {t('auth:signUp.form.action.submit', 'next')}
    </Button>
  </Grid>
);

SignUpFormActions.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['auth', 'main'])(SignUpFormActions);
