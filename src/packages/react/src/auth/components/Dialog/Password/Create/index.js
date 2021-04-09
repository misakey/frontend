import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

import { LARGE, APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';

import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import FormField from '@misakey/ui/Form/Field';

import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';
import CardUserSignOut from '@misakey/react/auth/components/Card/User/SignOut';
import FieldPasswordRevealable from '@misakey/ui/Form/Field/Password/Revealable';
import BoxControls from '@misakey/ui/Box/Controls';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import DialogPaperSlope from '@misakey/ui/Dialog/Paper/Slope';
import CardSso from '@misakey/react/auth/components/Card/Sso';

import Dialog from '@material-ui/core/Dialog';

import useGetOrgFromSearch from '@misakey/react/auth/hooks/useGetOrgFromSearch';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import { SET_PASSWORD } from '@misakey/react/auth/constants/account';

import isNil from '@misakey/core/helpers/isNil';

import hashPassword from '@misakey/core/auth/passwordHashing/hashPassword';
import { setPasswordSecretStoragePayload } from '@misakey/core/crypto';
import genParams from '@misakey/core/auth/passwordHashing/genParams';
import loadSecrets from '@misakey/react/crypto/store/actions/loadSecrets';
import createNewRootKeyShares from '@misakey/react/crypto/store/actions/createNewRootKeyShares';
import { setAccountPasswordBuilder } from '@misakey/core/auth/builder/accounts';
import { setPasswordValidationSchema } from '@misakey/react/auth/constants/validationSchemas/identity';
import asyncBatch from '@misakey/react/crypto/store/helpers/reduxBatchAsync';
import { updateIdentity } from '@misakey/react/auth/store/actions/auth';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { getCurrentUserSelector } from '@misakey/react/auth/store/reducers/auth';

// CONSTANTS
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 102,
};

const INITIAL_VALUES = {
  [SET_PASSWORD]: '',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardOverflowVisible: {
    overflow: 'visible',
  },
  dialogTitle: {
    margin: theme.spacing(1, 2),
    padding: theme.spacing(0),
    display: 'flex',
  },
}));

// COMPONENTS
function DialogCreatePassword({ open, onClose, isReset, ...rest }) {
  const classes = useStyles();
  const { t } = useTranslation(['auth', 'common']);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const currentUser = useSelector(getCurrentUserSelector);
  const { displayName, avatarUrl, identifierValue, accountId } = useSafeDestr(currentUser);

  const prefix = useMemo(() => (isReset ? 're' : ''), [isReset]);
  const i18nTextKey = useMemo(() => `${prefix}${SET_PASSWORD}`, [prefix]);

  const onCreateNewRootKeyShares = useCallback(
    (rootKey) => dispatch(createNewRootKeyShares({ rootKey, accountId }))
      .catch((reason) => {
        // failure of root key share creation should not make secret loading fail
        logSentryException(reason, 'Set password: create new root key share', { crypto: true });
      }),
    [accountId, dispatch],
  );

  const onLoadAccountState = useCallback(
    (secretStorage) => asyncBatch(() => {
      const { rootKey } = secretStorage;
      return Promise.all([
        dispatch(updateIdentity({ hasCrypto: true })),
        dispatch(loadSecrets({ secretStorage })),
        onCreateNewRootKeyShares(rootKey),
      ]);
    }),
    [dispatch, onCreateNewRootKeyShares],
  );

  const onSetPasswordBuilder = useCallback(
    (payload) => setAccountPasswordBuilder(accountId, payload).catch(handleHttpErrors),
    [accountId, handleHttpErrors],
  );

  const onSubmit = useCallback(
    async ({ [SET_PASSWORD]: password }) => {
      const [prehashedPassword, { payload, secretStorage }] = await Promise.all([
        hashPassword({ password, pwdHashParams: genParams() }),
        setPasswordSecretStoragePayload(password),
      ]);
      // API call
      await onSetPasswordBuilder({ prehashedPassword, secretStorage: payload });
      enqueueSnackbar(t(`auth:account.${i18nTextKey}.success`), { variant: 'success' });
      // Load new secrets in app
      await onLoadAccountState(secretStorage);
      onClose();
    },
    [enqueueSnackbar, i18nTextKey, onClose, onLoadAccountState, onSetPasswordBuilder, t],
  );

  useUpdateDocHead(t(`auth:account.${i18nTextKey}.documentTitle`));

  const { organization } = useGetOrgFromSearch();
  const { name, logoUrl } = useSafeDestr(organization);

  const avatar = useMemo(
    () => {
      if (!isNil(name)) {
        return (
          <AvatarColorized
            size={LARGE}
            text={name}
            image={logoUrl}
            colorizedProp={BACKGROUND_COLOR}
          />
        );
      }
      return <AvatarMisakey size={LARGE} />;
    },
    [logoUrl, name],
  );

  return (
    <Dialog
      open={open}
      fullScreen
      fullWidth
      onClose={onClose}
      PaperComponent={DialogPaperSlope}
      PaperProps={{
        header: (
          <DialogTitle className={classes.dialogTitle}>
            <Button
              color="background"
              standing={BUTTON_STANDINGS.TEXT}
              onClick={onClose}
              text={(
                <>
                  <ArrowBackIcon />
                  {t(`auth:account.${i18nTextKey}.back`)}
                </>
              )}
            />
          </DialogTitle>
        ),
        slopeProps: SLOPE_PROPS,
        avatar,
        avatarSize: LARGE,
      }}
      {...rest}
    >
      <Formik
        onSubmit={onSubmit}
        initialValues={INITIAL_VALUES}
        validationSchema={setPasswordValidationSchema}
      >
        <Form>
          <CardSso
            avatar={avatar}
            avatarSize={LARGE}
          >
            <Box display="flex" flexDirection="column" width="100%" justifyContent="center">
              <Title align="center" gutterBottom={false}>{t(`auth:account.${i18nTextKey}.title`)}</Title>
              <Subtitle align="center" gutterBottom={false}>{t(`auth:account.${i18nTextKey}.subtitle`)}</Subtitle>
              <CardUserSignOut
                my={3}
                className={classes.cardOverflowVisible}
                avatarUrl={avatarUrl}
                displayName={displayName}
                identifier={identifierValue}
                onSuccess={onClose}
              >
                <FormField
                  name={SET_PASSWORD}
                  prefix={prefix}
                  variant="filled"
                  component={FieldPasswordRevealable}
                  margin="none"
                  inputProps={{ 'data-matomo-ignore': true }}
                  FormHelperTextProps={{ component: FormHelperTextInCard }}
                  fullWidth
                  autoFocus
                />
              </CardUserSignOut>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:validate'),
                }}
                formik
              />
            </Box>
          </CardSso>
        </Form>
      </Formik>
    </Dialog>
  );
}


DialogCreatePassword.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  isReset: PropTypes.bool,
};

DialogCreatePassword.defaultProps = {
  open: false,
  isReset: false,
};

export default DialogCreatePassword;
