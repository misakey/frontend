import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import { identifierValidationSchema } from '@misakey/auth/constants/validationSchemas/auth';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import useSignOut from '@misakey/auth/hooks/useSignOut';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';


import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ChipUser from '@misakey/ui/Chip/User';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@misakey/ui/DialogContent';
import BoxControls from '@misakey/ui/Box/Controls';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AvatarUser from '@misakey/ui/Avatar/User';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import LoginFormFields from '@misakey/ui/Form/Fields/Login/Identifier';

// CONSTANTS
const INITIAL_VALUES = { identifier: '' };

// COMPONENTS
const DialogSigninRedirect = ({
  acrValues, loginHint,
  userManager,
  t,
  open,
  onClose,
  canCancelRedirect,
  ...props
}) => {
  const currentUser = useSelector(getCurrentUserSelector);
  const { displayName, avatarUrl } = useSafeDestr(currentUser);

  const objLoginHint = useMemo(
    () => (isEmpty(loginHint) ? null : objectToCamelCase(JSON.parse(loginHint))),
    [loginHint],
  );

  const { resourceName } = useSafeDestr(objLoginHint);

  const redirectOptions = useMemo(
    () => (isNil(acrValues)
      ? {
        ...props,
        loginHint,
      }
      : {
        ...props,
        loginHint,
        acrValues,
      }),
    [acrValues, loginHint, props],
  );

  const closableDialogProps = useMemo(
    () => (canCancelRedirect
      ? {
        onClose,
      }
      : {
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      }),
    [canCancelRedirect, onClose],
  );

  const dialogTitleProps = useMemo(
    () => (canCancelRedirect
      ? { onClose }
      : {}),
    [canCancelRedirect, onClose],
  );

  const title = useMemo(
    () => {
      if (!isNil(acrValues)) {
        return t('components:signinRedirect.acr');
      }
      if (!isNil(resourceName)) {
        return t('components:signinRedirect.resource', { resourceName });
      }
      return t('components:signinRedirect.default');
    },
    [resourceName, acrValues, t],
  );

  const onDelete = useSignOut(userManager);

  const onRedirect = useCallback(
    (options) => userManager.signinRedirect(objectToSnakeCase(options)),
    [userManager],
  );

  const onSubmit = useCallback(
    (({ identifier }) => {
      const options = isEmpty(identifier)
        ? redirectOptions
        : { ...redirectOptions, loginHint: JSON.stringify({ identifier }) };
      return onRedirect(options)
        .then(onClose);
    }),
    [onRedirect, onClose, redirectOptions],
  );

  return (
    <Dialog
      open={open}
      fullScreen
      {...closableDialogProps}
    >
      <Formik
        validationSchema={isNil(currentUser) && identifierValidationSchema}
        initialValues={INITIAL_VALUES}
        onSubmit={onSubmit}
      >
        <Form>
          <DialogTitleWithClose fullScreen {...dialogTitleProps} gutterBottom>
            <BoxFlexFill />
            {!isNil(currentUser) && <AvatarUser displayName={displayName} avatarUrl={avatarUrl} />}
          </DialogTitleWithClose>
          {open && (
            <DialogContent>
              <Title>{title}</Title>
              <Subtitle>{t('components:signinRedirect.subtitle')}</Subtitle>
              {!isNil(currentUser) ? (
                <Box my={2}>
                  <ChipUser
                    displayName={displayName}
                    avatarUrl={avatarUrl}
                    onDelete={onDelete}
                  />
                </Box>
              ) : (
                <LoginFormFields />
              )}
              <BoxControls
                primary={{
                  autoFocus: true,
                  type: 'submit',
                  text: t('common:confirm'),
                }}
                formik
              />
            </DialogContent>
          )}
        </Form>
      </Formik>
      <FooterFullScreen />
    </Dialog>
  );
};

DialogSigninRedirect.propTypes = {
  acrValues: PropTypes.number,
  loginHint: PropTypes.string,
  userManager: PropTypes.object.isRequired,
  canCancelRedirect: PropTypes.bool.isRequired,
  // DialogConfirm
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogSigninRedirect.defaultProps = {
  acrValues: null,
  loginHint: '',
  onClose: null,
};

export default withTranslation(['components', 'common'])(DialogSigninRedirect);
