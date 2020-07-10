import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useParams, generatePath } from 'react-router-dom';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { displayNameValidationSchema } from 'constants/validationSchemas/identity';

import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';
import { updateIdentity } from '@misakey/helpers/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from 'hooks/useDispatchUpdateIdentity';

import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldText from 'components/dumb/Form/Field/Text';
import ScreenAction from 'components/dumb/Screen/Action';

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

  const homePath = useMemo(
    () => generatePath(routes.accounts._, { id }),
    [id],
  );

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const state = useMemo(
    () => ({ isLoading: isFetching || isNil(identity) }),
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
      state={state}
      navigationProps={navigationProps}
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
