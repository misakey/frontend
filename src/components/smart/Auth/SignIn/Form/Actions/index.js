import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import routes from 'routes';

const SignInFormActions = ({ disableNext, isSubmitting, isValid, onNext, step, t }) => (
  <Grid container direction="row" justify="space-between" alignItems="flex-start">
    {step === 'email' && (
      <>
        <Button to={routes.auth.signUp._} component={Link} color="secondary">
          {t('auth:signIn.form.action.signUp')}
        </Button>
        <Button variant="contained" color="secondary" onClick={onNext} disabled={disableNext}>
          {t('auth:signIn.form.action.next')}
        </Button>
      </>
    )}
    {step === 'password' && (
      <>
        <Button to={routes.auth.forgotPassword} component={Link} color="secondary">
          {t('auth:signIn.form.action.forgotPassword')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={isSubmitting || !isValid}
        >
          {t('auth:signIn.form.action.submit')}
        </Button>
      </>
    )}
  </Grid>
);

SignInFormActions.propTypes = {
  disableNext: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  step: PropTypes.oneOf(['email', 'password']).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('auth')(SignInFormActions);
