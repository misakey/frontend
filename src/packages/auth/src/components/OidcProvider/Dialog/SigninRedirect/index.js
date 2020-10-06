import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { getCurrentUserSelector, selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { identifierValidationSchema } from '@misakey/auth/constants/validationSchemas/auth';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

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
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

// CONSTANTS
const { acr: ACR_SELECTOR } = authSelectors;

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
  const currentAcr = useSelector(ACR_SELECTOR);

  const { displayName, avatarUrl } = useSafeDestr(currentUser);

  const objLoginHint = useMemo(
    () => (isEmpty(loginHint) ? null : objectToCamelCase(JSON.parse(loginHint))),
    [loginHint],
  );

  const { resourceName } = useSafeDestr(objLoginHint);

  const propsWithoutTranslation = useMemo(
    () => omitTranslationProps(props),
    [props],
  );

  const redirectOptions = useMemo(
    () => (isNil(acrValues)
      ? {
        ...propsWithoutTranslation,
        loginHint,
      }
      : {
        ...propsWithoutTranslation,
        loginHint,
        acrValues,
      }),
    [acrValues, loginHint, propsWithoutTranslation],
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
      if (!isNil(resourceName)) {
        return t('components:signinRedirect.resource', { resourceName });
      }
      if (!isNil(currentUser) && (isNil(acrValues) || currentAcr >= acrValues)) {
        return t('components:signinRedirect.user');
      }
      if (!isNil(acrValues)) {
        return t(`components:signinRedirect.acr.${acrValues}`);
      }
      return t('components:signinRedirect.default');
    },
    [resourceName, currentUser, currentAcr, t, acrValues],
  );

  const submitText = useMemo(
    () => {
      if (!isNil(currentUser)) {
        return t('common:unlock');
      }
      return t('common:confirm');
    },
    [currentUser, t],
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
      return onRedirect(options);
    }),
    [onRedirect, redirectOptions],
  );

  useUpdateDocHead(t('components:signinRedirect.documentTitle'));

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
                  type: 'submit',
                  text: submitText,
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
