import React from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import API from '@misakey/api';

const useStyles = makeStyles((theme) => ({
  isSending: { marginRight: theme.spacing(1) },
}));

const SignUpConfirmFormActions = ({ isSubmitting, isValid, t, values: { email } }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setSending] = React.useState(false);

  function reSendConfirmCode() {
    setSending(true);

    API.use(API.endpoints.auth.askConfirm)
      .build(undefined, { email })
      .send()
      .then(() => {
        const text = t('auth:signUpConfirm.form.resend.success', { email });
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch((e) => {
        const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
        enqueueSnackbar(text, { variant: 'error' });
      })
      .finally(() => setSending(false));
  }

  return (
    <Grid container direction="row" justify="space-between" alignItems="flex-start">
      <Button color="secondary" onClick={reSendConfirmCode} disabled={isSending}>
        {isSending && (
          <CircularProgress color="secondary" size={17} className={classes.isSending} />
        )}
        {t('auth:signUpConfirm.form.action.resend')}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        type="submit"
        disabled={isSubmitting || !isValid}
      >
        {t('auth:signUpConfirm.form.action.submit', 'next')}
      </Button>
    </Grid>
  );
};

SignUpConfirmFormActions.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  values: PropTypes.shape({ email: PropTypes.string.isRequired }).isRequired,
};

export default withTranslation(['auth', 'main'])(SignUpConfirmFormActions);
