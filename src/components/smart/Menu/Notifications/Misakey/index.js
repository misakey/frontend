import React, { useRef, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { normalize } from 'normalizr';
import { useSelector, useDispatch, batch } from 'react-redux';
import moment from 'moment';

import { APPBAR_HEIGHT, TOOLBAR_MIN_HEIGHT, MENU_WIDTH, MENU_FULLSCREEN } from '@misakey/ui/constants/sizes';
import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';
import { decrementNewCount, setPaginationNotifications } from 'store/actions/identity/notifications';
import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';
import { makeGetUserNotificationsNotAckSelector, getPaginationSelector, getNewCountSelector } from 'store/reducers/identity/notifications';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { getUserNotificationsBuilder, acknowledgeUserNotificationsBuilder } from 'packages/helpers/src/builder/identities';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import range from '@misakey/helpers/range';
import debounce from '@misakey/helpers/debounce';

import { useTranslation } from 'react-i18next';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';

import ElevationScroll from '@misakey/ui/ElevationScroll';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AutoSizer from 'react-virtualized-auto-sizer';
import BoxEmpty from 'components/dumb/Box/Empty';
import InfiniteLoadedNotifications from 'components/smart/WindowedList/InfiniteLoaded/Notifications';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import MessageRow from 'components/smart/Menu/Notifications/Misakey/Row';
import MessageRowSkeleton from 'components/smart/Menu/Notifications/Misakey/Row/Skeleton';

import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;
const BATCH_SIZE = 10;

// CONSTANTS
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

const PRIMARY_TYPO_PROPS = {
  variant: 'body1',
  noWrap: true,
  color: 'textPrimary',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemRoot: {
    padding: 0,
  },
  menuPaper: ({ menuFullScreen }) => ({
    height: menuFullScreen ? '100%' : APPBAR_HEIGHT * 6,
    width: menuFullScreen ? MENU_FULLSCREEN : MENU_WIDTH,
    maxHeight: '100%',
    maxWidth: MENU_FULLSCREEN,
    [theme.breakpoints.down('sm')]: {
      width: MENU_FULLSCREEN,
      height: '100%',
    },
  }),
  menuList: {
    height: '100%',
    width: '100%',
  },
}));

// COMPONENTS
const MenuNotificationsMisakey = ({ onClose, open, ...props }) => {
  const ref = useRef();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const menuRef = useRef();
  const [menuFullScreen, setMenuFullScreen] = useState(false);

  const classes = useStyles({ menuFullScreen });

  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const { items, hasNextPage } = useSelector(getPaginationSelector);
  const newCount = useSelector(getNewCountSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation(['boxes', 'common']);

  const [seenItemsIndexes, setSeenItemsIndexes] = useState([]);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const isNilItems = useMemo(() => isNil(items), [items]);
  const itemsLength = useMemo(
    () => (isNilItems ? null : Object.keys(items).length),
    [isNilItems, items],
  );

  const fetchUserNotifications = useCallback(
    () => getUserNotificationsBuilder(identityId, { offset: itemsLength || 0, limit: BATCH_SIZE }),
    [identityId, itemsLength],
  );

  const onSuccess = useCallback(
    (response) => {
      const normalized = normalize(
        response,
        IdentityNotificationsSchema.collection,
      );
      const { entities, result } = normalized;
      batch(() => {
        dispatch(receiveEntities(entities));
        dispatch(setPaginationNotifications({
          hasNextPage: result.length === BATCH_SIZE,
          newNotifications: result,
        }));
      });
    },
    [dispatch],
  );

  const loadNextPage = useCallback(
    () => {
      setIsNextPageLoading(true);
      return fetchUserNotifications().then((response) => {
        onSuccess(response);
        setIsNextPageLoading(false);
        return Promise.resolve(response.length);
      });
    },
    [fetchUserNotifications, onSuccess],
  );

  const seenItemsValues = useMemo(
    () => (isNil(items) ? [] : seenItemsIndexes.map((index) => items[index])),
    [items, seenItemsIndexes],
  );

  const getUserNotificationsNotAckSelector = useMemo(
    () => makeGetUserNotificationsNotAckSelector(), [],
  );
  const itemIdsToAck = useSelector(
    (state) => getUserNotificationsNotAckSelector(state, seenItemsValues),
  );

  const onSeenItems = useCallback(
    ({ visibleStartIndex, visibleStopIndex }) => {
      setSeenItemsIndexes(range(visibleStartIndex, visibleStopIndex + 1));
    },
    [setSeenItemsIndexes],
  );

  const onWatchSeenItems = useMemo(
    // debounce with 0.5 seconds to ensure user really has time to see the elements
    // at loading, scroll position changes quickly so "seen" events triggered by those changes
    // should not be considered
    // it also avoid to trigger several request of two elements seen in backend
    // one call for 10 elements is better
    () => debounce(onSeenItems, 500),
    [onSeenItems],
  );

  const onItemsRendered = useMemo(
    () => (newCount > 0 ? onWatchSeenItems : undefined),
    [newCount, onWatchSeenItems],
  );

  const acknowledgeUserNotifications = useCallback(
    () => acknowledgeUserNotificationsBuilder(identityId, { ids: `${itemIdsToAck.join()}` })
      .then(() => {
        batch(() => {
          dispatch(updateEntities(
            itemIdsToAck.map((id) => ({ id, changes: { acknowledgedAt: moment().format() } })),
            IdentityNotificationsSchema,
          ));
          dispatch(decrementNewCount(itemIdsToAck.length));
        });
      }),
    [dispatch, identityId, itemIdsToAck],
  );

  const shouldAck = useMemo(() => !isEmpty(itemIdsToAck) && open, [itemIdsToAck, open]);

  useFetchEffect(
    acknowledgeUserNotifications,
    { shouldFetch: shouldAck },
  );

  const itemData = useMemo(
    () => ({ items, hasNextPage, onClick: onClose }),
    [hasNextPage, items, onClose],
  );

  const onToggleMenuFullscreen = useCallback(
    () => {
      setMenuFullScreen((prevValue) => !prevValue);
    },
    [setMenuFullScreen],
  );

  const menuFullScreenProps = useMemo(
    () => (menuFullScreen ? {
      anchorReference: 'anchorPosition',
      anchorPosition: { left: 0, top: 0 },
    } : {}),
    [menuFullScreen],
  );

  usePrevPropEffect(menuFullScreen, (prev, next) => {
    if (prev === true && next === false) {
      menuRef.current.updatePosition();
    }
  }, [menuRef]);

  return (
    <Menu
      action={menuRef}
      classes={{
        paper: classes.menuPaper,
        list: classes.menuList,
      }}
      marginThreshold={0}
      onClose={onClose}
      MenuListProps={{
        disablePadding: true,
      }}
      PaperProps={{
        square: isSmall || menuFullScreen,
      }}
      open={open}
      {...menuFullScreenProps}
      {...props}
    >
      <Box>
        <ElevationScroll target={!isNil(ref.current) ? ref.current.outerRef : undefined}>
          <AppBarStatic
            toolbarProps={TOOLBAR_PROPS}
          >
            <Box display="flex" width="100%" alignItems="center">
              <IconButton
                edge="start"
                aria-label={t('common:close')}
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
              {!isSmall && (
              <IconButton
                edge="start"
                aria-label={t('common:close')}
                onClick={onToggleMenuFullscreen}
              >
                {menuFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon /> }
              </IconButton>
              )}
              <ListItem component="div" classes={{ root: classes.listItemRoot }}>
                <ListItemText
                  primary={t('boxes:notifications.byIdentity.title')}
                  primaryTypographyProps={PRIMARY_TYPO_PROPS}
                />
              </ListItem>
              <AvatarMisakey alt={t('boxes:notifications.byIdentity.title')} />
            </Box>
          </AppBarStatic>
        </ElevationScroll>
      </Box>
      <Box height={`calc(100% - ${TOOLBAR_MIN_HEIGHT}px)`}>
        <AutoSizer>
          {(autoSizerProps) => (
            <InfiniteLoadedNotifications
              {...autoSizerProps}
              Row={MessageRow}
              Skeleton={MessageRowSkeleton}
              ref={ref}
              loadNextPage={loadNextPage}
              hasNextPage={hasNextPage}
              isNextPageLoading={isNextPageLoading}
              itemCount={itemsLength}
              itemData={itemData}
              onItemsRendered={onItemsRendered}
            />
          )}
        </AutoSizer>
        { itemsLength === 0 && <BoxEmpty title={t('boxes:notifications.byIdentity.empty')} py={0} /> }
      </Box>
    </Menu>
  );
};

MenuNotificationsMisakey.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default MenuNotificationsMisakey;
