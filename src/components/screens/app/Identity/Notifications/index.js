import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { notificationsValidationSchema } from 'constants/validationSchemas/identity';

import isNil from '@misakey/helpers/isNil';
import { updateIdentity } from '@misakey/helpers/builder/identities';
import { getDetails } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from 'hooks/useDispatchUpdateIdentity';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Subtitle from '@misakey/ui/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import FormFieldList from 'components/dumb/Form/Field/List';
import ListNotificationConfig from 'components/dumb/List/NotificationConfig';

// CONSTANTS
const FIELD_NAME = 'notifications';

// COMPONENTS
const IdentityNotifications = ({
  t,
  identity,
  isFetching,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const homePath = useGeneratePathKeepingSearchAndHash(routes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const { [FIELD_NAME]: notifications, id: identityId } = useMemo(
    () => identity || {},
    [identity],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const dispatchUpdateIdentity = useDispatchUpdateIdentity({ identityId, homePath });

  const onSubmit = useCallback(
    (form, { setSubmitting, setFieldError }) => updateIdentity({ id: identityId, ...form })
      .then(() => {
        enqueueSnackbar(t('account:notifications.success'), { variant: 'success' });
        dispatchUpdateIdentity(form);
      })
      .catch((e) => {
        const { [FIELD_NAME]: fieldError } = getDetails(e);
        if (fieldError) {
          setFieldError(FIELD_NAME, fieldError);
        } else {
          handleHttpErrors(e);
        }
      })
      .finally(() => { setSubmitting(false); }),
    [identityId, enqueueSnackbar, t, dispatchUpdateIdentity, handleHttpErrors],
  );

  const initialValues = useMemo(
    () => ({ notifications }),
    [notifications],
  );

  return (
    <ScreenAction
      title={t('account:notifications.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:notifications.subtitle')}
        </Subtitle>
        {notifications && (
          <Formik
            validationSchema={notificationsValidationSchema}
            onSubmit={onSubmit}
            initialValues={initialValues}
          >
            <Form>
              <Field
                name={FIELD_NAME}
              >
                {(fieldProps) => (
                  <FormFieldList
                    component={ListNotificationConfig}
                    {...fieldProps}
                  />
                )}
              </Field>
            </Form>
          </Formik>
        )}
      </Container>
    </ScreenAction>
  );
};

IdentityNotifications.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

IdentityNotifications.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account', 'fields'])(IdentityNotifications);
