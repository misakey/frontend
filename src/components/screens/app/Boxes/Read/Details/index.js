import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';

import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import isNil from '@misakey/helpers/isNil';
import useGeneratePathKeepingSearch from '@misakey/hooks/useGeneratePathKeepingSearch';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import BoxAvatar from 'components/dumb/Avatar/Box';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ConfirmationDialog from 'components/dumb/Dialog/Confirm';
import AvatarUser from '@misakey/ui/Avatar/User';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import CopyIcon from '@material-ui/icons/FilterNone';

import { ListItemSecondaryAction } from '@material-ui/core';
import { AVATAR_SIZE } from '@misakey/ui/constants/sizes';
import { CLOSED, OPEN } from 'constants/app/boxes/statuses';
import { LIFECYCLE } from 'constants/app/boxes/events';
import { createBoxEventBuilder, createKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { addBoxEvents } from 'store/reducers/box';
import BoxesSchema from 'store/schemas/Boxes';
import { splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';

// CONSTANTS
const CONTENT_SPACING = 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    width: `calc(3 * ${AVATAR_SIZE}px)`,
    height: `calc(3 * ${AVATAR_SIZE}px)`,
    fontSize: theme.typography.h4.fontSize,
    margin: theme.spacing(2, 0),
  },
  content: {
    maxHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${theme.spacing(CONTENT_SPACING) * 2}px)`,
    overflow: 'auto',
  },
}));

function BoxDetails({ drawerWidth, box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const {
    id,
    avatarUrl: boxAvatarUrl,
    title,
    publicKey,
    members,
    lifecycle,
  } = useMemo(() => box, [box]);

  const goBack = useGeneratePathKeepingSearch(routes.boxes.read._, { id });
  // const routeFiles = useGeneratePathKeepingSearch(routes.boxes.read.files, { id });

  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();

  const canInvite = useMemo(
    () => publicKeysWeCanDecryptFrom.has(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );

  const canShare = useMemo(() => canInvite && !isNil(navigator.share), [canInvite]);

  const createInvitation = useCallback(
    // @FIXME move this logic in a dedicated function
    // outside of the component?
    async () => {
      const secretKey = publicKeysWeCanDecryptFrom.get(publicKey);

      const { invitationKeyShare, misakeyKeyShare } = splitBoxSecretKey(secretKey);

      await createKeyShareBuilder(misakeyKeyShare);

      const invitationURL = parseUrlFromLocation(`${routes.boxes.invitation}#${id}&${invitationKeyShare}`).href;

      return invitationURL;
    },
    [id, publicKey, publicKeysWeCanDecryptFrom],
  );

  const onShare = useCallback(async () => {
    const invitationURL = await createInvitation();
    navigator.share({
      title: t('boxes:read.details.menu.share.title', { title }),
      text: t('boxes:read.details.menu.share.text', { title }),
      url: invitationURL,
    });
  }, [t, title, createInvitation]);

  const onInvite = useCallback(
    async () => {
      const invitationURL = await createInvitation();
      copy(invitationURL);
      enqueueSnackbar(t('common:copied'), { variant: 'success' });
    },
    [createInvitation, enqueueSnackbar, t],
  );

  const isAllowedToClose = useMemo(
    () => belongsToCurrentUser && lifecycle === OPEN,
    [belongsToCurrentUser, lifecycle],
  );

  const toggleCloseDialog = useCallback(
    () => { setIsCloseDialogOpen((current) => !current); }, [setIsCloseDialogOpen],
  );

  const onCloseBox = useCallback(
    () => createBoxEventBuilder(id, { type: LIFECYCLE, content: { state: CLOSED } })
      .then((response) => dispatch(addBoxEvents(id, response))),
    [dispatch, id],
  );

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer drawerWidth={drawerWidth}>
          <IconButtonAppBar
            color="inherit"
            aria-label={t('common:openAccountDrawer')}
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
        </AppBarDrawer>
      </ElevationScroll>
      <Box p={CONTENT_SPACING} ref={(ref) => setContentRef(ref)} className={classes.content}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <BoxAvatar
            classes={{ root: classes.avatar }}
            src={boxAvatarUrl}
            title={title || ''}
          />
          <Typography variant="h6" align="center">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('boxes:read.details.menu.members.count', { count: members.length })}
          </Typography>
        </Box>

        <List>
          <ListItem
            // button
            divider
            aria-label={t('boxes:read.details.menu.title')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.title')}
              secondary={title}
              primaryTypographyProps={{ variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ color: 'textPrimary' }}
            />
            {/* <ChevronRightIcon /> */}
          </ListItem>
          {belongsToCurrentUser && (
            <>
              {canShare && (
                <ListItem
                  divider
                  aria-label={t('boxes:read.details.menu.share.menuTitle')}
                >
                  <ListItemText
                    primary={t('boxes:read.details.menu.share.menuTitle')}
                    primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={onShare}
                      disabled={isNil(canShare)}
                      aria-label={t('common:share')}
                    >
                      <ShareIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
              <ListItem
                divider
                aria-label={t('boxes:read.details.menu.copyLink')}
              >
                <ListItemText
                  primary={t('boxes:read.details.menu.copyLink')}
                  primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={onInvite}
                    disabled={!canInvite}
                    aria-label={t('common:copy')}
                  >
                    <CopyIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </>
          )}
          {/* <ListItem
            button
            to={routeFiles}
            component={Link}
            divider
            aria-label={t('boxes:read.details.menu.files')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.files')}
              primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ noWrap: true, color: 'textPrimary' }}
            />
            <ChevronRightIcon />
          </ListItem> */}
          <ListItem
            // button
            // to={}
            // component={Link}
            divider
            aria-label={t('boxes:read.details.menu.encryption.primary')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.encryption.primary')}
              secondary={t('boxes:read.details.menu.encryption.secondary')}
              primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ color: 'textPrimary' }}
            />
            {/* <ChevronRightIcon /> */}
          </ListItem>
          {isAllowedToClose && (
            <ListItem
              button
              divider
              onClick={toggleCloseDialog}
              aria-label={t('boxes:read.details.menu.close.primary')}
            >
              <ListItemText
                primary={t('boxes:read.details.menu.close.primary')}
                secondary={t('boxes:read.details.menu.close.secondary')}
                primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
                secondaryTypographyProps={{ color: 'textPrimary' }}
              />
              <ConfirmationDialog
                onConfirm={onCloseBox}
                isDialogOpen={isCloseDialogOpen}
                onClose={toggleCloseDialog}
                dialogContent={t('boxes:read.details.menu.close.confirmDialog.text')}
              />
              <ChevronRightIcon />
            </ListItem>
          )}
          <List subheader={(
            <ListSubheader>
              <Typography noWrap variant="overline" color="textSecondary">
                {t('boxes:read.details.menu.members.title')}
              </Typography>
            </ListSubheader>
          )}
          >
            {members.map(({ displayName, avatarUrl, identifier }) => (
              <ListItem key={identifier.value}>
                <ListItemAvatar>
                  <AvatarUser src={avatarUrl} />
                </ListItemAvatar>
                <ListItemText
                  primary={displayName}
                  secondary={identifier.value}
                />
              </ListItem>
            ))}
          </List>
        </List>
      </Box>
    </>

  );
}

BoxDetails.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema).isRequired,
  belongsToCurrentUser: PropTypes.bool,
};

BoxDetails.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['common', 'boxes'])(BoxDetails);
