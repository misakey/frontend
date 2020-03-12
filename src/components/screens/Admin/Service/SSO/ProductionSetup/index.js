import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { useSnackbar } from 'notistack';

import makeStyles from '@material-ui/core/styles/makeStyles';

import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import ServiceSchema from 'store/schemas/Service';
import API from '@misakey/api';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import BoxSection from '@misakey/ui/Box/Section';
import ButtonCopy from '@misakey/ui/Button/Copy';
import ButtonSubmit from 'components/dumb/Button/Submit';
import FieldTextPasswordRevealable, { ADORNMENT_POSITION } from 'components/dumb/Field/Text/Password/Revealable';
import ScreenError from 'components/dumb/Screen/Error';
import ScreenAction from 'components/dumb/Screen/Action';

const PARENT_ROUTE = routes.admin.service.sso._;

const EMPTY_SECRET = '';

// HELPERS
const createSSOSecret = (id) => API
  .use(API.endpoints.sso.secret.create)
  .build({ id })
  .send();

// HOOKS
const useStyles = makeStyles((theme) => ({
  box: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    width: '100%',
  },
}));

const useOnGenerateSecret = (
  service,
  setClientSecret,
  setError,
  setSubmitting,
  enqueueSnackbar,
  t,
) => useCallback(
  () => createSSOSecret(service.id)
    .then((responseBody) => {
      const { clientSecret } = objectToCamelCase(responseBody);
      enqueueSnackbar(t('admin:sso.productionSetup.clientSecret.success'), { variant: 'success' });
      setClientSecret(clientSecret);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus || 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [service, setClientSecret, setError, setSubmitting, enqueueSnackbar, t],
);


// COMPONENTS
const SSOProductionSetup = ({ appBarProps, t, service }) => {
  const classes = useStyles();

  const [error, setError] = useState();
  const [isSubmitting, setSubmitting] = useState();
  const [clientSecret, setClientSecret] = useState(EMPTY_SECRET);
  const [prodStatus, setProdStatus] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onGenerateSecret = useOnGenerateSecret(
    service, setClientSecret, setError, setSubmitting, enqueueSnackbar, t,
  );

  const onSwitchProdStatus = useCallback(() => {
    setProdStatus((status) => !status);
    enqueueSnackbar(t(`admin:sso.productionSetup.production.success.${!prodStatus}`), { variant: 'success' });
  }, [prodStatus, setProdStatus, enqueueSnackbar, t]);

  const homePath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <ScreenAction
      navigationProps={{ homePath, toolbarProps: { maxWidth: 'md' } }}
      appBarProps={appBarProps}
      title={t('admin:sso.productionSetup.title')}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('admin:sso.productionSetup.subtitle')}
        </Typography>
        <BoxSection className={clsx(classes.box, 'box')} bgcolor={prodStatus ? 'text.disabled' : 'inherit'}>
          <Typography variant="h6" color="textPrimary" align="left" className="title">
            {t('admin:sso.productionSetup.clientSecret.title')}
          </Typography>
          {prodStatus ? (
            <Typography variant="body2" color="textSecondary" align="left" gutterBottom>
              {t('admin:sso.productionSetup.clientSecret.disabled.subtitle')}
            </Typography>
          )
            : (
              <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
                {t('admin:sso.productionSetup.clientSecret.subtitle')}
              </Typography>
            )}
          <Box mt={3}>
            <FieldTextPasswordRevealable
              className="field"
              name="clientSecret"
              label={t('fields:clientSecret.label')}
              adornmentPosition={ADORNMENT_POSITION.start}
              disabled={prodStatus}
              forceHide={prodStatus}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <ButtonCopy
                      color="default"
                      mode="icon"
                      edge="end"
                      value={clientSecret}
                      disabled={prodStatus}
                    />

                  </InputAdornment>
                ),
              }}
              value={clientSecret}
            />
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <ButtonSubmit
                isSubmitting={isSubmitting}
                onClick={onGenerateSecret}
                disabled={prodStatus}
                text={t('common:regenerate', 'Regenerate')}
              />
              <Box
                ml={1}
                component={ButtonSubmit}
                isSubmitting={isSubmitting}
                onClick={onSwitchProdStatus}
                text={prodStatus
                  ? t('admin:sso.productionSetup.leaveFromProd', 'Leave from production')
                  : t('admin:sso.productionSetup.goToProd', 'Go to production')}
              />
            </Box>
          </Box>
        </BoxSection>
      </Container>
    </ScreenAction>
  );
};

SSOProductionSetup.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape(ServiceSchema.propTypes),
  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

SSOProductionSetup.defaultProps = {
  appBarProps: null,
  service: null,
};

export default withTranslation(['admin', 'fields', 'common'])(SSOProductionSetup);
