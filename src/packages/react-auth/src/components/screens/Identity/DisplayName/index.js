import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

import IdentitySchema from '@misakey/react-auth/store/schemas/Identity';
import authRoutes from '@misakey/react-auth/routes';
import { displayNameValidationSchema } from '@misakey/react-auth/constants/validationSchemas/identity';

import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';
import { updateIdentity } from '@misakey/api/helpers/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from '@misakey/react-auth/hooks/useDispatchUpdateIdentity';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import ScreenAction from '@misakey/ui/Screen/Action';

// CONSTANTS
const FIELD_NAME = 'displayName';


// COMPONENTS
const IdentityDisplayName = ({
  t,
  identity,
  isFetching,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

  // @FIXME until we change structure, parent is public profile
  const homePath = useGeneratePathKeepingSearchAndHash(authRoutes.identities.public, { id });

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const { [FIELD_NAME]: displayName, id: identityId } = useMemo(
    () => identity || {},
    [identity],
  );

  const initialValues = useMemo(
    () => ({ displayName }),
    [displayName],
  );

  const handleHttpErrors = useHandleHttpErrors();
  const dispatchUpdateIdentity = useDispatchUpdateIdentity({ identityId, homePath });

  const onSubmit = useCallback(
    (form, { setSubmitting, setFieldError }) => updateIdentity({ id: identityId, ...form })
      .then(() => {
        enqueueSnackbar(t('account:displayName.success'), { variant: 'success' });
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

  return (
    <ScreenAction
      title={t('account:displayName.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:displayName.subtitle')}
        </Subtitle>
        {displayName && (
          <Formik
            validationSchema={displayNameValidationSchema}
            onSubmit={onSubmit}
            initialValues={initialValues}
          >
            <Form>
              <FormField
                type="text"
                name={FIELD_NAME}
                component={FieldText}
                inputProps={{ 'data-matomo-ignore': true }}
                variant="filled"
              />
              <BoxControls
                mt={3}
                primary={{
                  type: 'submit',
                  'aria-label': t('common:submit'),
                  text: t('common:submit'),
                }}
                formik
              />
            </Form>
          </Formik>
        )}
      </Container>
    </ScreenAction>
  );
};

IdentityDisplayName.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

IdentityDisplayName.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account'])(IdentityDisplayName);
