import React, { useMemo, useCallback, Fragment } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { getCurrentUserSelector, selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER, LARGE } from '@misakey/ui/constants/sizes';

import authRoutes from '@misakey/react/auth/routes';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Dialog from '@material-ui/core/Dialog';
import AvatarBox from '@misakey/ui/Avatar/Box';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import DialogPaperSlope from '@misakey/ui/Dialog/Paper/Slope';
import CardSso from '@misakey/react/auth/components/Card/Sso';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import BadgeDeniedWrapper from '@misakey/ui/Badge/Denied/Wrapper';
import DialogSigninRedirectNoUser from './NoUser';
import DialogSigninRedirectUser from './User';

// CONSTANTS
const { expiresAt: EXPIRES_AT_SELECTOR } = authSelectors;
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
  acrValues,
  loginHint,
  creator,
  displayHints,
  userManager,
  open,
  onClose,
  canCancelRedirect,
  fullScreen,
  ...props
}) => {
  const classes = useStyles();
  const currentUser = useSelector(getCurrentUserSelector);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(['components', 'common']);

  const { displayName: creatorName, id: creatorIdentityId } = useSafeDestr(creator);
  const { resourceName, client } = useSafeDestr(displayHints);
  const expiresAt = useSelector(EXPIRES_AT_SELECTOR);
  const { name: clientName, logoUri: clientLogo } = useSafeDestr(client);

  const creatorProfileTo = useMemo(
    () => (isNil(creatorIdentityId)
      ? null
      : generatePath(authRoutes.identities.public, { id: creatorIdentityId })),
    [creatorIdentityId],
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
      if (isEmpty(currentUser) || isNil(expiresAt)) { return false; }
      return moment().isAfter(expiresAt);
    },
    [currentUser, expiresAt],
  );

  const title = useMemo(
    () => (!isNil(resourceName)
      ? t('common:connect.title', { resourceName })
      : t('common:connect.client.title', { clientName: clientName || 'Misakey App' })),
    [resourceName, t, clientName],
  );

  const subtitle = useMemo(
    () => {
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
    [resourceName, currentUser, t, creatorName, creatorProfileTo],
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

  const onSignInRedirect = useCallback(
    ({ displayHints: newDisplayHints, ...restOptions } = {}) => {
      const extraQueryParams = {
        displayHints: JSON.stringify(
          isNil(newDisplayHints) ? displayHints : { ...displayHints, ...newDisplayHints },
        ),
      };
      // user choices `restOptions` on this dialog should override pre-asked params for UX coherence
      const options = { extraQueryParams, acrValues, ...props, ...restOptions };
      return userManager
        .signinRedirect(options)
        .catch(() => {
          enqueueSnackbar(t('common:error.storage'), { variant: 'warning', persist: true });
        });
    },
    [acrValues, displayHints, enqueueSnackbar, props, t, userManager],
  );

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
          {isEmpty(currentUser)
            ? (
              <DialogSigninRedirectNoUser
                onSignInRedirect={onSignInRedirect}
                title={title}
                subtitle={subtitle}
              />
            )
            : (
              <DialogSigninRedirectUser
                onSignInRedirect={onSignInRedirect}
                title={title}
                subtitle={subtitle}
                acrValues={acrValues}
              />
            )}
        </CardSso>
      )}
    </Dialog>
  );
};

DialogSigninRedirect.propTypes = {
  acrValues: PropTypes.number,
  loginHint: PropTypes.string,
  displayHints: PropTypes.object,
  creator: PropTypes.shape({
    name: PropTypes.string,
    logoUri: PropTypes.string,
  }),
  userManager: PropTypes.object.isRequired,
  canCancelRedirect: PropTypes.bool.isRequired,
  // DialogConfirm
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  fullScreen: PropTypes.bool,
};

DialogSigninRedirect.defaultProps = {
  acrValues: null,
  displayHints: {},
  loginHint: null,
  creator: {},
  onClose: null,
  fullScreen: false,
};

export default DialogSigninRedirect;
