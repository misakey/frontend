import React, { useCallback, useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { Link, generatePath } from 'react-router-dom';
import { Trans, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import useGetRoles from '@misakey/auth/hooks/useGetRoles';
import { loadUserRoles } from '@misakey/auth/store/actions/auth';

import routes from 'routes';

import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
import isInteger from '@misakey/helpers/isInteger';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import head from '@misakey/helpers/head';
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
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';


import SplashScreen from 'components/dumb/SplashScreen';
import BoxSection from 'components/dumb/Box/Section';
import ButtonSubmit from 'components/dumb/Button/Submit';
import BoxMessage from 'components/dumb/Box/Message';
import ErrorOverlay from 'components/dumb/Error/Overlay';
import ScreenAction from 'components/dumb/Screen/Action';
import Redirect from 'components/dumb/Redirect';

// @FIXME: add to @misakey/API
export const ENDPOINTS = {
  claim: {
    list: {
      method: 'GET',
      path: '/user-role-claims',
      auth: true,
    },
    create: {
      method: 'POST',
      path: '/user-role-claims',
      auth: true,
    },
    verify: {
      update: {
        method: 'PATCH',
        path: '/user-role-claims/:id',
        auth: true,
      },
    },
  },
};

// HOOKS

const useCreateClaim = (setClaim, userId, serviceId, role) => useCallback(() => {
  const payload = {
    user_role: {
      user_id: userId,
      application_id: serviceId,
      role_label: role,
    },
    type: 'dns',
  };

  return API.use(ENDPOINTS.claim.create)
    .build(null, objectToSnakeCase(payload))
    .send()
    .then((response) => { setClaim(objectToCamelCase(response)); });
}, [role, serviceId, setClaim, userId]);

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

function ServiceClaim({ appBarProps, service, t, userId, history, dispatchUserRoles, userRoles }) {
  const classes = useStyles();
  const width = useWidth();
  const { enqueueSnackbar } = useSnackbar();
  const role = useLocationWorkspace();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const { id: userRoleId, valid: userHasRole } = useMemo(
    () => {
      const { id } = service;
      const userRole = userRoles.find(
        ({ applicationId, roleLabel }) => applicationId === id && roleLabel === role,
      );
      return userRole || { valid: false };
    },
    [service, userRoles, role],
  );
  const [activeStep, setActiveStep] = useState(1);

  const [claim, setClaim] = useState({ value: '' });
  const [isFetching, setFetching] = useState(false);

  const [isSubmitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const i18nKey = useCallback((step) => `screens:Service.Claim.body.steps.content.${step}`, []);
  const fetchRoleList = useGetRoles(dispatchUserRoles);
  const pathToAdminHome = useMemo(
    () => generatePath(routes.admin.service._, { mainDomain: service.mainDomain }),
    [service.mainDomain],
  );

  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [setActiveStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, [setActiveStep]);

  const handleCopy = useCallback(() => {
    copy(claim.value);
    const text = t('screens:Service.Claim.body.txtKey.copied');
    enqueueSnackbar(text, { variant: 'success' });
  }, [claim, enqueueSnackbar, t]);

  const createClaim = useCreateClaim(setClaim, userId, service.id, role);

  const fetchClaim = useCallback(() => {
    if (isNil(service) || !isEmpty(claim.value) || isFetching || userHasRole) { return; }
    if (isNil(userRoleId)) { createClaim(); return; }

    setFetching(true);

    API.use(ENDPOINTS.claim.list)
      .build(null, null, { user_role_id: userRoleId })
      .send()
      .then((response) => {
        const found = head(response);
        if (isObject(found)) {
          setClaim(objectToCamelCase(found));
        } else { setError(400); }
      })
      .catch((e) => setError(e.httpStatus || 500))
      .finally(() => setFetching(false));
  }, [service, claim.value, isFetching, userHasRole, userRoleId, createClaim]);

  const handleSubmit = useCallback(() => {
    const { id } = claim;

    if (isNil(id)) { return; }

    setSubmitting(true);
    if (error) { setError(RETRY_ERROR); }

    const query = { id };
    const payload = { validated_at: moment.utc(Date.now()).format() };

    API.use(ENDPOINTS.claim.verify.update)
      .build(query, payload)
      .send()
      .then(() => { setSuccess(true); fetchRoleList(userId); })
      .catch((e) => {
        if (e.httpStatus === 403) {
          setError(VERIFY_ERROR);
        } else if (e.httpStatus === 409) {
          const text = t('screens:Service.Claim.body.txtKey.error.conflict');
          enqueueSnackbar(text, { variant: 'warning' });
        } else {
          handleGenericHttpErrors(e);
        }
      })
      .finally(() => setSubmitting(false));
  }, [claim, error, fetchRoleList, userId, t, enqueueSnackbar, handleGenericHttpErrors]);

  useEffect(fetchClaim, [service]);

  if (isFetching || isNil(service)) { return <SplashScreen />; }

  if (isInteger(error)) { return <ErrorOverlay httpStatus={error} />; }

  if (userHasRole) {
    enqueueSnackbar(t('screens:Service.role.claim.info.alreadyDpo', { mainDomain: service.mainDomain, role }), { variant: 'info' });
    return <Redirect to={pathToAdminHome} />;
  }

  const again = error === VERIFY_ERROR;
  const submitText = t(`screens:Service.Claim.body.txtKey.actions.submit${again ? 'Again' : ''}`);

  return (
    <ScreenAction
      id="ServiceClaim"
      history={history}
      appBarProps={appBarProps}
      title={t('screens:Service.Claim.body.title', service)}
    >
      <Container maxWidth="md">
        <Typography
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
            value={claim.value}
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
                  <Button
                    component={Link}
                    to={routes.admin.service.list}
                    className={classes.submitLater}
                  >
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
                to={generatePath(routes.admin.service._, { mainDomain: service.mainDomain })}
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
                        values={{ mainDomain: service.mainDomain, key: claim.value }}
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
                          key: claim.value,
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
    </ScreenAction>
  );
}

ServiceClaim.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mainDomain: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  dispatchUserRoles: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
};

ServiceClaim.defaultProps = {
  appBarProps: null,
  service: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchUserRoles: (roles) => dispatch(loadUserRoles(roles)),
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(ServiceClaim));
