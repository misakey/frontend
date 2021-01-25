import React, { useState, useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { colorValidationSchema } from 'constants/validationSchemas/identity';

import isNil from '@misakey/helpers/isNil';
import { updateIdentity } from '@misakey/helpers/builder/identities';
import { getDetails } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from 'hooks/useDispatchUpdateIdentity';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Subtitle from '@misakey/ui/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import BoxControls from '@misakey/ui/Box/Controls';
import CirclePickerField from 'components/dumb/Form/Field/CirclePicker';
import ColorsDemo from 'components/screens/app/Identity/Colors/Demo';

// CONSTANTS
const FIELD_NAME = 'color';


// COMPONENTS
const AccountColor = ({ t, identity, isFetching }) => {
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams();

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const { [FIELD_NAME]: color, id: identityId } = useMemo(
    () => identity || {},
    [identity],
  );

  const [previewColor, setPreviewColor] = useState(color);

  const homePath = useGeneratePathKeepingSearchAndHash(routes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const dispatchUpdateIdentity = useDispatchUpdateIdentity({ identityId, homePath });

  const onChange = useCallback(
    (nextColor) => {
      setPreviewColor(nextColor);
    },
    [setPreviewColor],
  );

  const onSubmit = useCallback(
    (form, { setSubmitting, setFieldError }) => updateIdentity({ id: identityId, ...form })
      .then(() => {
        enqueueSnackbar(t('account:accountColors.success'), { variant: 'success' });
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
    () => ({ [FIELD_NAME]: isNil(color) ? undefined : color }),
    [color],
  );

  return (
    <ScreenAction
      title={t('account:accountColors.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:accountColors.subtitle')}
        </Subtitle>
        <Formik
          validationSchema={colorValidationSchema}
          onSubmit={onSubmit}
          initialValues={initialValues}
        >
          <Form>
            <Field name={FIELD_NAME}>
              {(fieldProps) => (
                <CirclePickerField
                  {...fieldProps}
                  onChange={onChange}
                />
              )}
            </Field>
            <BoxControls
              mt={3}
              primary={{
                type: 'submit',
                'aria-label': t('common:confirm'),
                text: t('common:confirm'),
              }}
              formik
            />
          </Form>
        </Formik>
        <ColorsDemo color={previewColor} />
      </Container>
    </ScreenAction>
  );
};

AccountColor.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AccountColor.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['common', 'account', 'fields'])(AccountColor);
