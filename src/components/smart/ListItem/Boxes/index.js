import React, { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import BoxesSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { getBoxEventLastDate } from 'helpers/boxEvent';
import getNextSearch from '@misakey/helpers/getNextSearch';
import isSelfOrg from 'helpers/isSelfOrg';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useBoxRights from 'hooks/useBoxRights';
import useContextMenuAnchorEl from '@misakey/hooks/useContextMenuAnchor/el';
import useIsMountedRef from '@misakey/hooks/useIsMountedRef';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHashCallback from '@misakey/hooks/useGeneratePathKeepingSearchAndHash/callback';

import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@misakey/ui/Badge';
import BoxAvatar from '@misakey/ui/Avatar/Box';
import BoxAvatarSkeleton from '@misakey/ui/Avatar/Box/Skeleton';
import TypographyDateSince from 'components/dumb/Typography/DateSince';
import BoxEventsAccordingToType from 'components/smart/Box/Event';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import MenuItemBoxMute from 'components/smart/MenuItem/Box/Mute';
import MenuItemBoxLeave from 'components/smart/MenuItem/Box/Leave';
import MenuItemBoxDelete from 'components/smart/MenuItem/Box/Delete';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';

// CONSTANTS
const DEFAULT_SETTINGS = { muted: false };

const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

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
  menuButton: ({ isActionVisible }) => ({
    visibility: isActionVisible ? 'visible' : 'hidden',
  }),
  listItemRoot: ({ isActionVisible }) => ({
    paddingRight: isActionVisible ? theme.spacing(6) : theme.spacing(2),
  }),
  listItemSelected: {
    '& > .MuiListItemAvatar-root .MuiAvatar-root': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  titleSpaced: {
    marginRight: theme.spacing(1),
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
        ...restClasses,
      }}
      {...props}
    >
      <ListItemAvatar>
        <BoxAvatarSkeleton />
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

function BoxListItem({ box, toRoute, nextSearchMap, ContainerProps, classes, t, ...rest }) {
  const [anchorEl, setAnchorEl] = useState(null);
  // prefer state variable over css because hover is not enough to handle UX
  const [isActionVisible, setIsActionVisible] = useState(false);
  const internalClasses = useStyles({ isActionVisible });
  const { root, selected, ...restClasses } = useSafeDestr(classes);

  const isMounted = useIsMountedRef();

  const { search } = useLocation();
  const generatePath = useGeneratePathKeepingSearchAndHashCallback();

  const {
    id,
    title,
    publicKey,
    lastEvent = {},
    eventsCount = 0,
    settings: { muted } = DEFAULT_SETTINGS,
    ownerOrgId,
  } = useMemo(() => box || {}, [box]);

  const nextSearch = useMemo(
    () => (isSelfOrg(ownerOrgId)
      ? getNextSearch(search, new Map([['orgId', undefined], ...nextSearchMap]))
      : getNextSearch(search, new Map([['orgId', ownerOrgId], ...nextSearchMap]))),
    [nextSearchMap, ownerOrgId, search],
  );

  const linkProps = useMemo(
    () => (isNil(toRoute) || isNil(id) ? {} : {
      to: generatePath(toRoute, { id }, nextSearch),
      button: true,
      component: Link,
    }),
    [generatePath, id, nextSearch, toRoute],
  );

  const secondary = useMemo(
    () => (isNil(box) || isEmpty(lastEvent)
      ? null // @FIXME we could create a Skeleton
      : (
        <BoxEventsAccordingToType box={box} event={lastEvent} preview />
      )),
    [lastEvent, box],
  );

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

  const showEventsCount = useMemo(
    () => canBeDecrypted,
    [canBeDecrypted],
  );

  const badgeProps = useMemo(
    () => {
      if (muted) {
        return {
          badgeContent: <NotificationsOffIcon style={{ fontSize: 12 }} />,
          color: 'primary',
        };
      }
      return {
        badgeContent: showEventsCount ? eventsCount : 0,
        color: 'primary',
      };
    },
    [muted, showEventsCount, eventsCount],
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
        ...restClasses,
      }}
      onContextMenu={onContextMenu}
      {...linkProps}
      {...omitTranslationProps(rest)}
    >
      <ListItemAvatar>
        <Badge {...badgeProps}>
          <BoxAvatar
            title={title}
            lostKey={lostKey}
          />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        className={internalClasses.listItemText}
        primary={(
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography className={internalClasses.titleSpaced} noWrap>{title}</Typography>
            {!isActionVisible && <TypographyDateSince date={date} className="hideOnHover" />}
          </Box>
        )}
        secondary={secondary}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block', component: Box }}
      />
      <ListItemSecondaryAction>
        <IconButton className={internalClasses.menuButton} onClick={onContextMenu} edge="end" aria-label="menu-more">
          <MoreVertIcon />
        </IconButton>
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
  );
}

BoxListItem.propTypes = {
  ContainerProps: PropTypes.object,
  classes: PropTypes.shape({
    root: PropTypes.string,
    selected: PropTypes.string,
  }),
  box: PropTypes.shape(BoxesSchema.propTypes),
  toRoute: PropTypes.string,
  nextSearchMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  // withTranslation
  t: PropTypes.func.isRequired,
};

BoxListItem.defaultProps = {
  ContainerProps: {},
  classes: {},
  box: null,
  toRoute: null,
  nextSearchMap: [],
};

export default withTranslation('common')(BoxListItem);
