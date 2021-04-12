import React, { useMemo, useCallback, Fragment } from 'react';
import moment from 'moment';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { getCurrentUserSelector, selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER, LARGE } from '@misakey/ui/constants/sizes';

import authRoutes from '@misakey/react/auth/routes';

import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Dialog from '@material-ui/core/Dialog';
import BoxControls from '@misakey/ui/Box/Controls';
import AvatarBox from '@misakey/ui/Avatar/Box';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import CardUserAuth from '@misakey/react/auth/components/Card/User';
import CardUserSignOut from '@misakey/react/auth/components/Card/User/SignOut';
import DialogPaperSlope from '@misakey/ui/Dialog/Paper/Slope';
import CardSso from '@misakey/react/auth/components/Card/Sso';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import BadgeDeniedWrapper from '@misakey/ui/Badge/Denied/Wrapper';

// CONSTANTS
const { acr: getCurrentAcrSelector, expiresAt: EXPIRES_AT_SELECTOR } = authSelectors;
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 114,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogTitleIconButton: {
    color: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.reverse.action.hover,
    },
  },
  dialogTitleRoot: {
    margin: theme.spacing(0, 2),
  },
  dialogTitleTitle: {
    fontWeight: theme.typography.fontWeightBold,
    flexGrow: 1,
  },
}));

// COMPONENTS
const DialogSigninRedirect = ({
  acrValues, loginHint,
  userManager,
  open,
  onClose,
  canCancelRedirect,
  fullScreen,
  ...props
}) => {
  const classes = useStyles();
  const currentUser = useSelector(getCurrentUserSelector);
  const currentAcr = useSelector(getCurrentAcrSelector);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(['components', 'common']);

  const objLoginHint = useMemo(
    () => (isEmpty(loginHint) ? null : objectToCamelCase(JSON.parse(loginHint))),
    [loginHint],
  );

  const { resourceName, creatorName, creatorIdentityId, client } = useSafeDestr(objLoginHint);
  const expiresAt = useSelector(EXPIRES_AT_SELECTOR);
  const { name: clientName, logoUri: clientLogo } = useSafeDestr(client);

  const creatorProfileTo = useMemo(
    () => (isNil(creatorIdentityId)
      ? null
      : generatePath(authRoutes.identities.public, { id: creatorIdentityId })),
    [creatorIdentityId],
  );

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

  const sessionExpired = useMemo(
    () => {
      if (!isEmpty(currentUser) && !isNil(expiresAt)) { return false; }
      return moment().isAfter(expiresAt);
    },
    [currentUser, expiresAt],
  );

  const insufficientACR = useMemo(
    () => !isEmpty(currentUser) && !isNil(currentAcr) && currentAcr < acrValues,
    [acrValues, currentAcr, currentUser],
  );

  const title = useMemo(
    () => {
      if (sessionExpired) {
        return t('components:signinRedirect.user.expired.title');
      }
      if (insufficientACR) {
        return t(`components:signinRedirect.user.insufficientACR.${acrValues}.title`);
      }
      if (!isNil(resourceName)) {
        return t('common:connect.title', { resourceName });
      }
      return t('common:connect.client.title', { clientName: clientName || 'Misakey App' });
    },
    [sessionExpired, insufficientACR, resourceName, t, clientName, acrValues],
  );

  const subtitle = useMemo(
    () => {
      if (sessionExpired) {
        return t('components:signinRedirect.user.expired.subtitle');
      }
      if (insufficientACR) {
        return t(`components:signinRedirect.user.insufficientACR.${acrValues}.subtitle`);
      }
      if (!isNil(resourceName)) {
        return isEmpty(currentUser)
          ? t('components:signinRedirect.user.authRequired')
          : (
            <TransRequireAccess querier={creatorName} to={creatorProfileTo} />
          );
      }
      return isEmpty(currentUser)
        ? t('components:signinRedirect.user.authRequired')
        : <TransRequireAccess />;
    },
    [
      sessionExpired, insufficientACR, resourceName, currentUser,
      t, acrValues, creatorName, creatorProfileTo,
    ],
  );

  const avatar = useMemo(
    () => {
      const Wrapper = sessionExpired ? BadgeDeniedWrapper : Fragment;
      const wrapperProps = sessionExpired ? { size: LARGE } : {};
      if (!isNil(resourceName)) {
        return (
          <Wrapper {...wrapperProps}>
            <AvatarBox
              title={resourceName}
              size={LARGE}
            />
          </Wrapper>
        );
      }
      if (!isNil(clientName)) {
        return (
          <Wrapper {...wrapperProps}>
            <AvatarColorized
              size={LARGE}
              image={clientLogo}
              text={clientName}
              colorizedProp={BACKGROUND_COLOR}
            />
          </Wrapper>
        );
      }
      return (
        <Wrapper {...wrapperProps}>
          <AvatarMisakey size={LARGE} />
        </Wrapper>
      );
    },
    [clientLogo, clientName, resourceName, sessionExpired],
  );

  const text = useMemo(
    () => (isEmpty(currentUser) ? t('common:continue') : t('common:confirm')),
    [currentUser, t],
  );

  const CardUserComponent = useMemo(
    () => (!isEmpty(currentUser) ? CardUserSignOut : CardUserAuth),
    [currentUser],
  );

  const onClick = useCallback(
    () => userManager
      .signinRedirect(redirectOptions)
      .catch(() => {
        enqueueSnackbar(t('common:error.storage'), { variant: 'warning', persist: true });
      }),
    [enqueueSnackbar, redirectOptions, t, userManager],
  );

  useUpdateDocHead(t('components:signinRedirect.documentTitle'));

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      fullWidth
      {...closableDialogProps}
      PaperComponent={DialogPaperSlope}
      PaperProps={{
        header: (
          <DialogTitleWithClose
            classes={{
              root: classes.dialogTitleRoot,
              iconButton: classes.dialogTitleIconButton,
              title: classes.dialogTitleTitle,
            }}
            fullScreen
            {...dialogTitleProps}
          />
        ),
        slopeProps: SLOPE_PROPS,
        avatar,
        avatarSize: LARGE,
      }}
    >
      {open && (
        <CardSso avatarSize={LARGE}>
          <Box>
            <TitleBold align="center" gutterBottom={false}>{title}</TitleBold>
            <Subtitle align="center">{subtitle}</Subtitle>
            {!isEmpty(currentUser) && (
              <CardUserComponent
                my={3}
                expired={sessionExpired}
              />
            )}
          </Box>
          <BoxControls
            primary={{
              text,
              onClick,
            }}
          />
        </CardSso>
      )}
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
  fullScreen: PropTypes.bool,
};

DialogSigninRedirect.defaultProps = {
  acrValues: null,
  loginHint: '',
  onClose: null,
  fullScreen: false,
};

export default DialogSigninRedirect;
