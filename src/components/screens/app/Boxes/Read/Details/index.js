import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { AVATAR_SIZE, APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import { CLOSED, OPEN } from 'constants/app/boxes/statuses';
import { LIFECYCLE } from 'constants/app/boxes/events';
import { removeEntities } from '@misakey/store/actions/entities';
import BoxesSchema from 'store/schemas/Boxes';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

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
import BoxAvatar from 'components/dumb/Avatar/Box';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ConfirmationDialog from '@misakey/ui/Dialog/Confirm';
import ListItemShare from 'components/smart/ListItem/Boxes/Share';
import ListItemLeave from 'components/smart/ListItem/Boxes/Leave';
import ListItemDelete from 'components/smart/ListItem/Boxes/Delete';
import ListItemMember from 'components/dumb/ListItem/Member';

// CONSTANTS
const { conflict } = errorTypes;
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
    boxSizing: 'border-box',
    maxHeight: `calc(100% - ${APPBAR_HEIGHT}px)`,
    overflow: 'auto',
  },
  subheader: {
    backgroundColor: theme.palette.background.default,
  },
  primaryText: {
    color: theme.palette.text.primary,
  },
}));

function BoxDetails({ isDrawerOpen, box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const {
    id,
    avatarUrl: boxAvatarUrl,
    title,
    members = [],
    lifecycle,
  } = useMemo(() => box, [box]);

  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id });
  // const routeFiles = useGeneratePathKeepingSearchAndHash(routes.boxes.read.files, { id });

  // @FIXME factorize rules
  const isAllowedToClose = useMemo(
    () => belongsToCurrentUser && lifecycle === OPEN,
    [belongsToCurrentUser, lifecycle],
  );

  const isAllowedToDelete = useMemo(
    () => belongsToCurrentUser && lifecycle === CLOSED,
    [belongsToCurrentUser, lifecycle],
  );

  const isAllowedToLeave = useMemo(
    () => !belongsToCurrentUser,
    [belongsToCurrentUser],
  );

  const toggleCloseDialog = useCallback(
    () => {
      setIsCloseDialogOpen((current) => !current);
    }, [setIsCloseDialogOpen],
  );

  const onCloseBox = useCallback(
    () => createBoxEventBuilder(id, { type: LIFECYCLE, content: { state: CLOSED } })
      .catch((error) => {
        if (error.code === conflict) {
          const { details = {} } = error;
          if (details.lifecycle === conflict) {
            dispatch(removeEntities([{ id }], BoxesSchema));
            enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
          }
        } else {
          handleHttpErrors(error);
        }
      }),
    [dispatch, enqueueSnackbar, handleHttpErrors, id, t],
  );

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer position="static" disableOffset isDrawerOpen={isDrawerOpen}>
          <IconButtonAppBar
            aria-label={t('common:openAccountDrawer')}
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
        </AppBarDrawer>
      </ElevationScroll>
      <Box p={CONTENT_SPACING} pt={0} ref={(ref) => setContentRef(ref)} className={classes.content}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <BoxAvatar
            classes={{ root: classes.avatar }}
            src={boxAvatarUrl}
            title={title || ''}
          />
          <Typography variant="h6" align="center" color="textPrimary">
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
          <ListItemShare box={box} />
          {isAllowedToLeave && <ListItemLeave box={box} />}
          {isAllowedToDelete && <ListItemDelete box={box} />}
          {isAllowedToClose && (
            <>
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
                <ChevronRightIcon className={classes.primaryText} />
              </ListItem>
              <ConfirmationDialog
                onConfirm={onCloseBox}
                isDialogOpen={isCloseDialogOpen}
                onClose={toggleCloseDialog}
              >
                {t('boxes:read.details.menu.close.confirmDialog.text')}
              </ConfirmationDialog>
            </>
          )}
          <List subheader={(
            <ListSubheader className={classes.subheader}>
              <Typography noWrap variant="overline" color="textSecondary">
                {t('boxes:read.details.menu.members.title')}
              </Typography>
            </ListSubheader>
          )}
          >
            {members.map((member) => (
              <ListItemMember
                key={member.identifier.value}
                member={member}
                box={box}
                belongsToCurrentUser={belongsToCurrentUser}
              />
            ))}
          </List>
        </List>
      </Box>
    </>

  );
}

BoxDetails.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  belongsToCurrentUser: PropTypes.bool,
};

BoxDetails.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['common', 'boxes'])(BoxDetails);
