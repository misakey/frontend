import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useSignOut from '@misakey/auth/hooks/useSignOut';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import MuiLink from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ChipUser from '@misakey/ui/Chip/User';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@misakey/ui/DialogContent';
import BoxControls from '@misakey/ui/Box/Controls';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AvatarUser from '@misakey/ui/Avatar/User';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import List from '@material-ui/core/List';
import ListItemConsentEmail from '@misakey/ui/ListItem/Consent/Email';
import AvatarBox from '@misakey/ui/Avatar/Box';
import AvatarMisakeyDenied from '@misakey/ui/Avatar/Misakey/Denied';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listFullWidth: {
    width: '100%',
  },
  dialogContentRoot: {
    [theme.breakpoints.only('xs')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  dialogContentContent: {
    alignItems: 'center',
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
  ...props
}) => {
  const classes = useStyles();
  const isXs = useXsMediaQuery();

  const currentUser = useSelector(getCurrentUserSelector);
  const { enqueueSnackbar } = useSnackbar();

  const { displayName, avatarUrl, identifier } = useSafeDestr(currentUser);
  const { value: identifierValue } = useSafeDestr(identifier);

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
    () => !isNil(currentUser),
    [currentUser],
  );

  const title = useMemo(
    () => {
      if (sessionExpired) {
        return t('components:signinRedirect.user.title');
      }
      if (!isNil(resourceName)) {
        return t('common:connect.title', { resourceName });
      }
      return t('common:connect.misakey.title');
    },
    [resourceName, t, sessionExpired],
  );

  const subtitle = useMemo(
    () => {
      if (sessionExpired) {
        return t('components:signinRedirect.user.subtitle');
      }
      if (!isNil(resourceName)) {
        return (
          <Trans values={{ creatorName }} i18nKey="common:connect.subtitle">
            Information below will be shared with
            <MuiLink
              color="secondary"
              component={Link}
              to={creatorProfileTo}
              target="_blank"
              rel="noopener noreferrer"
            >
              {'{{creatorName}}'}
            </MuiLink>
            to continue
          </Trans>
        );
      }
      return t('common:connect.misakey.subtitle');
    },
    [resourceName, sessionExpired, t, creatorName, creatorProfileTo],
  );

  const onDelete = useSignOut(userManager);

  const onRedirect = useCallback(
    (options) => userManager.signinRedirect(objectToSnakeCase(options)),
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
      fullScreen
      {...closableDialogProps}
    >
      <DialogTitleWithClose fullScreen {...dialogTitleProps} gutterBottom>
        <BoxFlexFill />
        {!isNil(currentUser) && <AvatarUser displayName={displayName} avatarUrl={avatarUrl} />}
      </DialogTitleWithClose>
      {open && (
        <DialogContent
          classes={{ root: classes.dialogContentRoot, content: classes.dialogContentContent }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
          >
            {sessionExpired ? (<AvatarMisakeyDenied large />) : (
              <>
                {isNil(resourceName) ? (
                  <AvatarMisakey large />
                ) : (
                  <AvatarBox
                    title={resourceName}
                    large
                  />
                )}
              </>
            )}
            <Box mt={2}>
              <Title>{title}</Title>
              <Subtitle>{subtitle}</Subtitle>
              {!sessionExpired && (
                <List className={classes.listFullWidth}>
                  <ListItemConsentEmail
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    email={identifierValue}
                    selected
                  >
                    <Button
                      standing={BUTTON_STANDINGS.MAIN}
                      text={t('common:confirm')}
                      onClick={onClick}
                      size={isXs ? 'small' : 'medium'}
                    />
                  </ListItemConsentEmail>
                </List>
              )}
            </Box>
            {!isNil(currentUser) && (
              <Box my={2} alignSelf="center">
                <ChipUser
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  onDelete={onDelete}
                />
              </Box>
            )}
            {sessionExpired && (
              <BoxControls
                primary={{
                  text: t('common:confirm'),
                  onClick,
                }}
              />
            )}
          </Box>
        </DialogContent>
      )}
      <FooterFullScreen />
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
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogSigninRedirect.defaultProps = {
  acrValues: null,
  loginHint: '',
  onClose: null,
};

export default withTranslation(['components', 'common'])(DialogSigninRedirect);
