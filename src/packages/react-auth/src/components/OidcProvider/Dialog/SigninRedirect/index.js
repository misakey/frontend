import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { getCurrentUserSelector, selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';
import { LARGE } from '@misakey/ui/Avatar';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Dialog from '@material-ui/core/Dialog';
import BoxControls from '@misakey/ui/Box/Controls';
import AvatarBox from '@misakey/ui/Avatar/Box';
import AvatarMisakeyDenied from '@misakey/ui/Avatar/Misakey/Denied';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import CardUserAuth from '@misakey/react-auth/components/Card/User';
import CardUserSignOut from '@misakey/react-auth/components/Card/User/SignOut';
import DialogPaperSlope from '@misakey/ui/Dialog/Paper/Slope';
import CardSso from '@misakey/react-auth/components/Card/Sso';

// CONSTANTS
const { acr: getCurrentAcrSelector } = authSelectors;
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
}));

// COMPONENTS
const DialogSigninRedirect = ({
  acrValues, loginHint,
  userManager,
  t,
  open,
  onClose,
  canCancelRedirect,
  publicRoute,
  fullScreen,
  ...props
}) => {
  const classes = useStyles();
  const currentUser = useSelector(getCurrentUserSelector);
  const currentAcr = useSelector(getCurrentAcrSelector);
  const { enqueueSnackbar } = useSnackbar();

  const objLoginHint = useMemo(
    () => (isEmpty(loginHint) ? null : objectToCamelCase(JSON.parse(loginHint))),
    [loginHint],
  );

  const { resourceName, creatorName, creatorIdentityId } = useSafeDestr(objLoginHint);

  const creatorProfileTo = useMemo(
    () => (isNil(creatorIdentityId) ? null : generatePath(publicRoute, { id: creatorIdentityId })),
    [publicRoute, creatorIdentityId],
  );

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

  const sessionExpired = useMemo(
    () => !isEmpty(currentUser) && (isNil(currentAcr) || currentAcr === acrValues),
    [acrValues, currentAcr, currentUser],
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
      return t('common:connect.misakey.title');
    },
    [sessionExpired, insufficientACR, resourceName, t, acrValues],
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
        return (
          <TransRequireAccess querier={creatorName} to={creatorProfileTo} />
        );
      }
      return <TransRequireAccess />;
    },
    [sessionExpired, insufficientACR, resourceName, t, acrValues, creatorName, creatorProfileTo],
  );

  const CardUserComponent = useMemo(
    () => (!isEmpty(currentUser) ? CardUserSignOut : CardUserAuth),
    [currentUser],
  );

  const onRedirect = useCallback(
    (options) => userManager.signinRedirect(options),
    [userManager],
  );

  const onClick = useCallback(
    () => onRedirect(redirectOptions).catch(() => {
      enqueueSnackbar(t('common:error.storage'), { variant: 'warning', persist: true });
    }),
    [enqueueSnackbar, onRedirect, redirectOptions, t],
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
            classes={{ root: classes.dialogTitleRoot, iconButton: classes.dialogTitleIconButton }}
            fullScreen
            {...dialogTitleProps}
          />
        ),
        slopeProps: SLOPE_PROPS,
        avatar: sessionExpired ? (<AvatarMisakeyDenied size={LARGE} />) : (
          <>
            {isNil(resourceName) ? (
              <AvatarMisakey size={LARGE} />
            ) : (
              <AvatarBox
                title={resourceName}
                size={LARGE}
              />
            )}
          </>
        ),
        avatarLarge: true,
      }}
    >
      {open && (
      <CardSso avatarLarge>
        <Box>
          <Title align="center" gutterBottom={false}>{title}</Title>
          <Subtitle align="center">{subtitle}</Subtitle>
          <CardUserComponent
            my={3}
            expired={sessionExpired}
          />
        </Box>
        <BoxControls
          primary={{
            text: t('common:confirm'),
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
  publicRoute: PropTypes.string.isRequired,
  // DialogConfirm
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  fullScreen: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogSigninRedirect.defaultProps = {
  acrValues: null,
  loginHint: '',
  onClose: null,
  fullScreen: false,
};

export default withTranslation(['components', 'common'])(DialogSigninRedirect);
