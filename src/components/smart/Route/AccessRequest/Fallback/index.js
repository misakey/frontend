import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { Trans, withTranslation } from 'react-i18next';

import API from '@misakey/api';
import { accessTokenUpdate } from 'store/actions/access';
import { accessRequestValidationSchema } from 'constants/validationSchemas/auth';
import ApplicationSchema from 'store/schemas/Application';

import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import log from '@misakey/helpers/log';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import FormFields from 'components/dumb/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';
import ScreenAction from 'components/dumb/Screen/Action';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import Card from 'components/dumb/Card';
import { Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';

// CONSTANTS
const DEFAULT_FIELDS = { code: { component: FieldCode, label: undefined } };
const INITIAL_VALUES = { code: '' };

// @FIXME: js-common
const ENDPOINTS = {
  databoxes: {
    confirmationCode: {
      create: {
        method: 'POST',
        path: '/databoxes/confirmation-code',
      },
    },
    accessToken: {
      create: {
        method: 'POST',
        path: '/databoxes/access-token',
      },
    },
  },
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarParent: {
    // Maybe this style should be more documented
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  p: {
    marginTop: theme.spacing(2),
    textAlign: 'justify',
  },
}));

// HELPERS
const getOwnerEmail = path(['owner', 'email']);
const getOwnerName = path(['owner', 'display_name']);

// COMPONENTS
function AccessRequestFallback({
  accessRequest, dispatchAccessTokenUpdate, error, isFetching, producer, t,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [isRequestingCode, setIsRequestingCode] = useState(false);

  const appBarProps = useMemo(
    () => ({
      withUser: false,
      withSearchBar: false,
      items: [(
        // @FIXME Make a dumb component of it
        <div className={classes.avatarParent} key="applicationAvatarParent">
          <ApplicationAvatar application={producer} />
        </div>
      )],
    }),
    [classes.avatarParent, producer],
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: isFetching,
    }),
    [error, isFetching],
  );

  const ownerName = useMemo(
    () => getOwnerName(accessRequest),
    [accessRequest],
  );

  const ownerEmail = useMemo(
    () => getOwnerEmail(accessRequest),
    [accessRequest],
  );

  const handleEmail = useCallback(() => {
    setIsRequestingCode(true);
    const payload = { accessRequestToken: accessRequest.token };

    API.use(ENDPOINTS.databoxes.confirmationCode.create)
      .build(null, objectToSnakeCase(payload))
      .send()
      .then(() => {
        const text = t('screens:accessRequest.email.success', accessRequest);
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch((e) => {
        const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
        enqueueSnackbar(text, { variant: 'error' });
      })
      .finally(() => setIsRequestingCode(false));
  }, [accessRequest, enqueueSnackbar, t]);

  const handleSubmit = useCallback((values, { setSubmitting, setErrors }) => {
    setSubmitting(true);

    const payload = {
      confirmationCode: values.code.join(''),
      accessRequestToken: accessRequest.token,
    };

    API.use(ENDPOINTS.databoxes.accessToken.create)
      .build(null, objectToSnakeCase(payload))
      .send()
      .then((response) => {
        dispatchAccessTokenUpdate(objectToCamelCase(response));
        enqueueSnackbar(t('screens:accessRequest.token.success', { ownerEmail }), { variant: 'success' });
      })
      .catch((e) => {
        log(e);
        const details = prop('details')(e);
        if (details) {
          setErrors({ code: details.confirmation_code });
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => setSubmitting(false));
  }, [accessRequest.token, dispatchAccessTokenUpdate, enqueueSnackbar, t, ownerEmail]);

  return (
    <ScreenAction
      appBarProps={appBarProps}
      state={state}
      title={t('screens:accessRequest.title', { ownerName, ownerEmail })}
    >
      <Container maxWidth="md">
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={accessRequestValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Card
                title={t('screens:accessRequest.form.title')}
                subtitle={t('screens:accessRequest.form.subtitle', accessRequest)}
                secondary={{
                  variant: 'outlined',
                  isLoading: isRequestingCode,
                  text: t('screens:accessRequest.email.submit'),
                  onClick: handleEmail,
                }}
                primary={{
                  variant: 'contained',
                  type: 'submit',
                  isLoading: isSubmitting,
                  text: t('common:submit'),
                }}
              >
                <FormFields
                  fields={DEFAULT_FIELDS}
                  prefix="AccessRequest."
                  defaultFields={DEFAULT_FIELDS}
                />
              </Card>
            </Form>
          )}
        </Formik>
        <Card
          mt={2}
          title={t('screens:accessRequest.troubleshooting.title')}
          subtitle={t('screens:accessRequest.troubleshooting.subtitle', accessRequest)}
        >
          <Typography className={classes.p}>
            {t('screens:accessRequest.troubleshooting.desc.1')}
          </Typography>
          <Typography className={classes.p}>
            <Trans i18nKey="screens:accessRequest.troubleshooting.desc.2">
              {'Si vous rencontrez un problème, n\'hésitez pas à nous contacter à'}
              <Link href="mailto:question.pro@misakey.com">question.pro@misakey.com</Link>
              , nous vous répondrons rapidement !
            </Trans>
          </Typography>
        </Card>
      </Container>
    </ScreenAction>
  );
}

AccessRequestFallback.propTypes = {
  accessRequest: PropTypes.shape({
    producerName: PropTypes.string,
    dpoEmail: PropTypes.string,
    token: PropTypes.string,
  }),
  dispatchAccessTokenUpdate: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool.isRequired,
  producer: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
};

AccessRequestFallback.defaultProps = {
  accessRequest: null,
  error: null,
  producer: {},
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchAccessTokenUpdate: (accessToken) => {
    dispatch(accessTokenUpdate(accessToken));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(AccessRequestFallback));
