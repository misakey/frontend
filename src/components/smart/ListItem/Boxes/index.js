import React, { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import { SMALL } from '@misakey/ui/constants/sizes';
import BoxesSchema from 'store/schemas/Boxes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import { getBoxEventLastDate } from '@misakey/ui/helpers/boxEvent';
import getNextSearch from '@misakey/core/helpers/getNextSearch';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useBoxRights from 'hooks/useBoxRights';
import useContextMenuAnchorEl from '@misakey/hooks/useContextMenuAnchor/el';
import useIsMountedRef from '@misakey/hooks/useIsMountedRef';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHashCallback from '@misakey/hooks/useGeneratePathKeepingSearchAndHash/callback';
import { useSelector } from 'react-redux';

import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemTextTertiary from '@misakey/ui/ListItemText/Tertiary';
import Badge from '@material-ui/core/Badge';
import BoxAvatar from 'components/smart/Avatar/Box';
import AvatarSkeleton from '@misakey/ui/Avatar/Skeleton';
import TypographyDateSince from 'components/dumb/Typography/DateSince';
import BoxEventsAccordingToType from 'components/smart/Box/Event';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import MenuItemBoxMute from 'components/smart/MenuItem/Box/Mute';
import MenuItemBoxLeave from 'components/smart/MenuItem/Box/Leave';
import MenuItemBoxDelete from 'components/smart/MenuItem/Box/Delete';
import ChipDatatag from 'components/smart/Chip/Datatag';

import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import ContextBoxDialogs from 'components/smart/Context/Boxes/Dialogs';

// CONSTANTS
const DEFAULT_SETTINGS = { muted: false };

const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;
const { makeGetAsymSecretKey } = cryptoSelectors;

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemText: {
    // Needed for IE11
    width: '100%',
  },
  iconStack: {
    position: 'absolute',
  },
  background: {
    visibility: '0.5',
  },
  badgeMenuButtonRoot: {
    display: 'flex',
    alignItems: 'center',
  },
  badgeMenuButtonBadge: {
    transform: 'none',
    top: 'auto',
    right: -12, // to match button edge-end,
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.getContrastText(theme.palette.action.disabledBackground),
  },
  badgeMenuButtonColorPrimary: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  menuButton: ({ isActionVisible }) => ({
    visibility: isActionVisible ? 'visible' : 'hidden',
  }),
  listItemRoot: ({ isActionVisible }) => ({
    paddingRight: isActionVisible ? theme.spacing(6) : null,
  }),
  listItemGutters: {
    paddingLeft: theme.spacing(1),
    '&.Mui-selected.MuiListItem-gutters': {
      paddingLeft: 5,
    },
    paddingRight: theme.spacing(1),
  },
  listItemAvatarRoot: {
    paddingRight: theme.spacing(1),
  },
  tertiaryFlex: {
    display: 'flex',
  },
}));

// COMPONENTS
export const BoxListItemSkeleton = ({ classes, toRoute, nextSearchMap, ...props }) => {
  const { root, selected, ...restClasses } = useSafeDestr(classes);

  const internalClasses = useStyles({ isActionVisible: false });

  return (
    <ListItem
      classes={{
        root: clsx(root, internalClasses.listItemRoot),
        selected: clsx(selected, internalClasses.listItemSelected),
        gutters: internalClasses.listItemGutters,
        ...restClasses,
      }}
      {...props}
    >
      <ListItemAvatar classes={{ root: internalClasses.listItemAvatarRoot }}>
        <AvatarSkeleton />
      </ListItemAvatar>
      <ListItemText
        primary={(
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Skeleton
              component="span"
              variant="text"
              width="50%"
            />
            <Skeleton
              component="span"
              variant="text"
              width="30%"
            />

          </Box>
        )}
        secondary={(
          <Skeleton
            component="span"
            variant="text"
            width="50%"
          />
        )}
      />
      <ListItemSecondaryAction />
    </ListItem>
  );
};

BoxListItemSkeleton.propTypes = {
  classes: PropTypes.shape({
    root: PropTypes.string,
    selected: PropTypes.string,
  }),
  toRoute: PropTypes.string,
  nextSearchMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

BoxListItemSkeleton.defaultProps = {
  classes: {},
  toRoute: null,
  nextSearchMap: [],
};

function BoxListItem({ id, box, toRoute, nextSearchMap, ContainerProps, classes, ...rest }) {
  const [anchorEl, setAnchorEl] = useState(null);
  // prefer state variable over css because hover is not enough to handle UX
  const [isActionVisible, setIsActionVisible] = useState(false);
  const internalClasses = useStyles({ isActionVisible });
  const { root, selected, ...restClasses } = useSafeDestr(classes);

  const isMounted = useIsMountedRef();

  const { search } = useLocation();
  const generatePath = useGeneratePathKeepingSearchAndHashCallback();

  const {
    title,
    publicKey,
    lastEvent = {},
    eventsCount = 0,
    settings: { muted } = DEFAULT_SETTINGS,
    ownerOrgId,
    datatagId,
    members,
  } = useSafeDestr(box);

  const nextSearch = useMemo(
    () => getNextSearch(search, new Map(nextSearchMap)),
    [nextSearchMap, search],
  );

  const linkProps = useMemo(
    () => (isNil(toRoute) || isNil(id) ? {} : {
      to: generatePath(toRoute, { id }, nextSearch),
      button: true,
      component: Link,
    }),
    [generatePath, id, nextSearch, toRoute],
  );

  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );
  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));
  const canBeDecrypted = useMemo(
    () => !isNil(secretKey),
    [secretKey],
  );

  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);
  const { canDelete, canLeave } = useBoxRights(box, belongsToCurrentUser);

  const lostKey = useMemo(
    () => !canBeDecrypted,
    [canBeDecrypted],
  );

  const secondary = useMemo(
    () => {
      if (isNil(box) || isEmpty(lastEvent)) {
        return <Skeleton width={300} />;
      }
      return <BoxEventsAccordingToType box={box} event={lastEvent} preview />;
    },
    [box, lastEvent],
  );

  const showEventsCount = useMemo(
    () => canBeDecrypted,
    [canBeDecrypted],
  );

  const badgeProps = useMemo(
    () => ({
      badgeContent: showEventsCount ? eventsCount : 0,
      color: muted ? 'default' : 'primary',
      variant: isActionVisible ? 'dot' : 'standard',
      showZero: false,
    }),
    [showEventsCount, eventsCount, muted, isActionVisible],
  );

  const date = useMemo(
    () => getBoxEventLastDate(lastEvent),
    [lastEvent],
  );

  const { onContextMenu } = useContextMenuAnchorEl({
    onAnchor: setAnchorEl,
  });

  const onClose = useCallback(
    () => {
      if (isMounted.current === true) {
        setAnchorEl(null);
      }
    },
    [isMounted, setAnchorEl],
  );

  const showAction = useCallback(
    () => {
      if (isMounted.current) {
        setIsActionVisible(true);
      }
    },
    [setIsActionVisible, isMounted],
  );
  const hideAction = useCallback(
    () => {
      if (isMounted.current) {
        setIsActionVisible(false);
      }
    },
    [setIsActionVisible, isMounted],
  );

  if (isNil(id) || isNil(title)) {
    return null;
  }

  return (
    <ContextBoxDialogs
      box={box}
      canLeave={canLeave}
      canDelete={canDelete}
    >
      <ListItem
        key={id}
        ContainerProps={{
          onMouseEnter: showAction,
          onMouseLeave: hideAction,
          ...ContainerProps,
        }}
        classes={{
          root: clsx(root, internalClasses.listItemRoot),
          selected: clsx(selected, internalClasses.listItemSelected),
          gutters: internalClasses.listItemGutters,
          ...restClasses,
        }}
        onContextMenu={onContextMenu}
        {...linkProps}
        {...rest}
      >
        <ListItemAvatar classes={{ root: internalClasses.listItemAvatarRoot }}>
          <BoxAvatar
            title={title}
            lostKey={lostKey}
            identityId={identityId}
            ownerOrgId={ownerOrgId}
            members={members}
          />
        </ListItemAvatar>
        <ListItemTextTertiary
          className={internalClasses.listItemText}
          primary={(
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box
                overflow="hidden"
                display="flex"
                flexDirection="row"
                alignItems="center"
                mr={1}
              >
                <Typography noWrap>{title}</Typography>
                {muted && (
                <NotificationsOffIcon color="disabled" fontSize="small" />
                )}
              </Box>
              {!isActionVisible
            && (
              <TypographyDateSince date={date} />
            )}
            </Box>
        )}
          secondary={secondary}
          tertiary={(
            <ChipDatatag size={SMALL} datatagId={datatagId} />
        )}
          primaryTypographyProps={{ noWrap: true, display: 'block', component: Box }}
          secondaryTypographyProps={{ noWrap: true, display: 'block', variant: 'body2', component: Box }}
          tertiaryTypographyProps={{
            noWrap: true, display: 'inline', component: Box, className: internalClasses.tertiaryFlex }}
        />
        <ListItemSecondaryAction>
          <Badge
            classes={{
              root: internalClasses.badgeMenuButtonRoot,
              badge: internalClasses.badgeMenuButtonBadge,
              colorPrimary: internalClasses.badgeMenuButtonColorPrimary,
            }}
            {...badgeProps}
          >
            <IconButton className={internalClasses.menuButton} onClick={onContextMenu} edge="end" aria-label="menu-more">
              <MoreHorizIcon />
            </IconButton>
          </Badge>
          <Menu
            id={`menu-box-${id}`}
            anchorEl={anchorEl}
            open={!isNil(anchorEl)}
            onClose={onClose}
            onClick={onClose}
            keepMounted
            variant="menu"
            MenuListProps={{ disablePadding: true }}
            PaperProps={{ variant: 'outlined' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItemBoxMute box={box} />
            {canDelete && <MenuItemBoxDelete box={box} onClose={hideAction} />}
            {canLeave && <MenuItemBoxLeave box={box} onClose={hideAction} />}
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
    </ContextBoxDialogs>
  );
}

BoxListItem.propTypes = {
  ContainerProps: PropTypes.object,
  classes: PropTypes.shape({
    root: PropTypes.string,
    selected: PropTypes.string,
  }),
  id: PropTypes.string.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes),
  toRoute: PropTypes.string,
  nextSearchMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

BoxListItem.defaultProps = {
  ContainerProps: {},
  classes: {},
  box: null,
  toRoute: null,
  nextSearchMap: [],
};

export default BoxListItem;
