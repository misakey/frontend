import React, { useMemo, useCallback, lazy } from 'react';

import { Switch, Route, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import { avatarValidationSchema } from 'constants/validationSchemas/identity';

import retry from '@misakey/helpers/retry';
import isNil from '@misakey/helpers/isNil';
import pick from '@misakey/helpers/pick';
import { getIdentity } from '@misakey/auth/builder/identities';
import { uploadAvatar } from '@misakey/helpers/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDispatchUpdateIdentity from 'hooks/useDispatchUpdateIdentity';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Box from '@material-ui/core/Box';

// LAZY
const AccountAvatarDisplay = lazy(() => retry(() => import('components/screens/app/Identity/Avatar/Display')));
const AccountAvatarUpload = lazy(() => retry(() => import('components/screens/app/Identity/Avatar/Upload')));


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
  const homePath = useGeneratePathKeepingSearchAndHash(routes.identities.public, { id });

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
                path={routes.identities.avatar._}
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
                path={routes.identities.avatar.upload}
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
