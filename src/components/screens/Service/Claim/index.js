import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Link, generatePath } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';

import routes from 'routes';

import API from '@misakey/api';
import find from '@misakey/helpers/find';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';
import isInteger from '@misakey/helpers/isInteger';
import useWidth from '@misakey/hooks/useWidth';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Skeleton from '@material-ui/lab/Skeleton';

import SplashScreen from '@misakey/ui/SplashScreen';
import BoxSection from '@misakey/ui/Box/Section';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import BoxMessage from '@misakey/ui/Box/Message';
import ErrorOverlay from '@misakey/ui/Error/Overlay';

// @FIXME: add to @misakey/API
export const ENDPOINTS = {
  claim: {
    list: {
      method: 'GET',
      path: '/application-claims',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/application-claims',
      auth: true,
    },
    verify: {
      update: {
        method: 'PATCH',
        path: '/application-claims/:id',
        auth: true,
      },
    },
  },
};

const STEPS = [1, 2, 3];

const VERIFY_ERROR = Symbol('verify.403');
const RETRY_ERROR = Symbol('retry');

const useStyles = makeStyles((theme) => ({
  stepper: {
    padding: 0,
    marginTop: theme.spacing(2),
  },
  submitLater: {
    marginRight: theme.spacing(1),
  },
  txtKeyActions: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  stepButton: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

function ServiceClaim({ service, t, userId }) {
  const classes = useStyles();
  const width = useWidth();
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = React.useState(1);

  const [claim, setClaim] = React.useState({ validation_token: '' });
  const [isFetching, setFetching] = React.useState(false);

  const [isSubmitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  const i18nKey = React.useCallback((step) => `screens:Service.Claim.body.steps.content.${step}`);

  const handleNext = React.useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [setActiveStep]);

  const handleBack = React.useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, [setActiveStep]);

  const handleCopy = React.useCallback(() => {
    copy(claim.validation_token);
    const text = t('screens:Service.Claim.body.txtKey.copied');
    enqueueSnackbar(text, { variant: 'success' });
  }, [claim, enqueueSnackbar, t]);

  const fetchClaim = React.useCallback(() => {
    function createClaim() {
      const payload = {
        user_id: userId,
        application_id: service.id,
        valid: false,
      };

      return API.use(ENDPOINTS.claim.create)
        .build(null, payload)
        .send()
        .then((response) => { setClaim(response); });
    }

    if (isNil(service)) { return; }

    setFetching(true);

    API.use(ENDPOINTS.claim.list)
      .build()
      .send()
      .then((response) => {
        const found = find(response, ['application_id', service.id]);
        if (isObject(found)) {
          setClaim(found);
        } else { createClaim(); }
      })
      .catch((e) => setError(e.httpStatus || 500))
      .finally(() => setFetching(false));
  }, [userId, service, setFetching, setError, setClaim]);

  const handleSubmit = React.useCallback(() => {
    const { id } = claim;

    if (isNil(id)) { return; }

    setSubmitting(true);
    if (error) { setError(RETRY_ERROR); }

    const query = { id };
    const payload = { valid: true };

    API.use(ENDPOINTS.claim.verify.update)
      .build(query, payload)
      .send()
      .then(() => { setSuccess(true); })
      .catch((e) => {
        if (e.httpStatus === 403) {
          setError(VERIFY_ERROR);
        } else if (e.httpStatus === 409) {
          const text = t('screens:Service.Claim.body.txtKey.error.conflict');
          enqueueSnackbar(text, { variant: 'warning' });
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => setSubmitting(false));
  }, [claim, error, setSubmitting, setError, enqueueSnackbar, t]);

  React.useEffect(fetchClaim, [service]);

  if (isFetching || isNil(service)) { return <SplashScreen />; }

  if (isInteger(error)) { return <ErrorOverlay httpStatus={error} />; }

  const again = error === VERIFY_ERROR;
  const submitText = t(`screens:Service.Claim.body.txtKey.actions.submit${again ? 'Again' : ''}`);

  return (
    <section id="ServiceClaim">
      <Container maxWidth="md">
        <Typography variant="h4" component="h3" align="center">
          {t('screens:Service.Claim.body.title', service)}
        </Typography>
        <Typography
          align="center"
          variant="subtitle1"
          color="textSecondary"
          gutterBottom
        >
          {t('screens:Service.Claim.body.subTitle')}
        </Typography>

        <BoxSection my={3}>
          <Typography variant="h5" component="h4">
            {t('screens:Service.Claim.body.txtKey.title')}
          </Typography>
          <TextField
            label={t('screens:Service.Claim.body.txtKey.label', { mainDomain: service.mainDomain })}
            multiline
            rowsMax="4"
            value={claim.validation_token}
            className={classes.textField}
            margin="normal"
            variant="outlined"
            fullWidth
            InputProps={{ readOnly: true }}
          />
          {success && (
            <BoxMessage
              type="success"
              my={1}
              mx={0}
              text={t('screens:Service.Claim.body.txtKey.success', service)}
            />
          )}
          {error === VERIFY_ERROR && (
            <BoxMessage
              type="error"
              className={classes.boxMessage}
              text={t(`screens:Service.Claim.body.txtKey.error.notYet${width === 'xs' ? 'Short' : ''}`)}
            />
          )}
          {(error === RETRY_ERROR && isSubmitting) && (
            <Skeleton classes={classes.boxMessage} variant="text" width="100%" height={54} />
          )}
          <Typography className={classes.txtKeyActions}>
            <Button onClick={handleCopy}>
              {t('screens:Service.Claim.body.txtKey.actions.copy')}
            </Button>
            {!success && (
              <span>
                {error === VERIFY_ERROR && (
                  <Button component={Link} to={routes.service.list} className={classes.submitLater}>
                    {t('screens:Service.Claim.body.txtKey.actions.submitLater')}
                  </Button>
                )}
                <ButtonSubmit
                  text={submitText}
                  onClick={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </span>
            )}
            {success && (
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to={generatePath(routes.service._, { mainDomain: service.mainDomain })}
              >
                {t('next')}
              </Button>
            )}
          </Typography>
        </BoxSection>

        <BoxSection mb={3}>
          <Typography variant="h5" component="h4">
            {t('screens:Service.Claim.body.steps.title')}
          </Typography>
          <Stepper activeStep={activeStep - 1} orientation="vertical" className={classes.stepper}>
            {STEPS.map((step) => (
              <Step key={step}>
                <StepLabel>{t(`screens:Service.Claim.body.steps.label.${step}`)}</StepLabel>
                <StepContent>
                  <Typography>
                    {step === STEPS[1] ? (
                      <Trans
                        i18nKey={i18nKey(step)}
                        values={{ mainDomain: service.mainDomain, key: claim.validation_token }}
                      >
                        {'Ajoutez une nouvelle entrée DNS, de Type "TXT".'}
                        {'De nom (sous-domaine)'}
                        <code>{'_misakey.{{mainDomain}}'}</code>
                        De valeur
                        <code>{'{{key}}'}</code>
                        Enregistrez.
                      </Trans>
                    ) : (
                      <Trans i18nKey={i18nKey(step)}>
                        {t(i18nKey(step), {
                          mainDomain: service.mainDomain,
                          key: claim.validation_token,
                        })}
                      </Trans>
                    )}
                  </Typography>
                  <Box mb={2} display="flex" justifyContent="flex-end">
                    <Button
                      disabled={activeStep === 1}
                      onClick={handleBack}
                      className={classes.stepButton}
                    >
                      {t('back')}
                    </Button>
                    {activeStep !== STEPS.length && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      className={classes.stepButton}
                    >
                      {t('next')}
                    </Button>
                    )}
                    {activeStep === STEPS.length && (
                    <ButtonSubmit
                      text={submitText}
                      onClick={handleSubmit}
                      isSubmitting={isSubmitting}
                      className={classes.stepButton}
                    />
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </BoxSection>
      </Container>
    </section>
  );
}

ServiceClaim.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mainDomain: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

ServiceClaim.defaultProps = {
  service: null,
};

export default withTranslation(['common', 'screens'])(ServiceClaim);
