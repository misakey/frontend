import React, { useMemo, useCallback, lazy } from 'react';

import { Switch, Route, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';
import authRoutes from '@misakey/react/auth/routes';
import { avatarValidationSchema } from '@misakey/react/auth/constants/validationSchemas/identity';

import retry from '@misakey/core/helpers/retry';
import isNil from '@misakey/core/helpers/isNil';
import pick from '@misakey/core/helpers/pick';
import { getIdentity } from '@misakey/core/auth/builder/identities';
import { uploadAvatar } from '@misakey/core/api/helpers/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from '@misakey/react/auth/hooks/useDispatchUpdateIdentity';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Box from '@material-ui/core/Box';

// LAZY
const AccountAvatarDisplay = lazy(() => retry(() => import('@misakey/react/auth/components/screens/Identity/Avatar/Display')));
const AccountAvatarUpload = lazy(() => retry(() => import('@misakey/react/auth/components/screens/Identity/Avatar/Upload')));


// CONSTANTS
const FIELD_NAME = 'avatar';
const PREVIEW_NAME = 'preview';
const INITIAL_VALUES = {
  [FIELD_NAME]: null,
};
const EMPTY_OBJECT = {};

// HELPERS
const pickForm = pick(Object.keys(INITIAL_VALUES));
const pickChanges = pick(['avatarUrl']);

// COMPONENTS
const AccountAvatar = ({
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

  // @FIXME until we change structure, parent is public profile
  const homePath = useGeneratePathKeepingSearchAndHash(authRoutes.identities.public, { id });

  const { displayName, avatarUrl, id: identityId } = useMemo(
    () => identity || EMPTY_OBJECT,
    [identity],
  );

  const initialValues = useMemo(
    () => ({ avatar: avatarUrl }),
    [avatarUrl],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const dispatchUpdateIdentity = useDispatchUpdateIdentity({ identityId, homePath });

  const onSubmit = useCallback(
    (form, { setSubmitting }) => uploadAvatar({ id: identityId, avatar: pickForm(form) })
      .then(() => getIdentity(identityId))
      .then((response) => {
        const changes = pickChanges(response);
        enqueueSnackbar(t('account:avatar.success'), { variant: 'success' });
        dispatchUpdateIdentity(changes);
      })
      .catch(handleHttpErrors)
      .finally(() => { setSubmitting(false); }),
    [handleHttpErrors, identityId, enqueueSnackbar, t, dispatchUpdateIdentity],
  );

  return (
    <Box display="flex" flexGrow={1}>
      <Formik
        validationSchema={avatarValidationSchema}
        onSubmit={onSubmit}
        initialValues={initialValues}
      >
        {(formikProps) => (
          <Box component={Form} width="100%">
            <Switch>
              <Route
                exact
                path={authRoutes.identities.avatar._}
                render={(routerProps) => (
                  <AccountAvatarDisplay
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    name={FIELD_NAME}
                    previewName={PREVIEW_NAME}
                    isLoading={isLoading}
                    {...formikProps}
                    {...routerProps}
                  />
                )}
              />
              <Route
                exact
                path={authRoutes.identities.avatar.upload}
                render={(routerProps) => (
                  <AccountAvatarUpload
                    name={FIELD_NAME}
                    previewName={PREVIEW_NAME}
                    isLoading={isLoading}
                    {...formikProps}
                    {...routerProps}
                  />
                )}
              />
            </Switch>

          </Box>
        )}
      </Formik>
    </Box>
  );
};

AccountAvatar.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountAvatar.defaultProps = {
  identity: null,
  error: null,
  isFetching: false,
};

export default withTranslation(['account'])(AccountAvatar);
