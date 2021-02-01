import React, { useRef, useState, useCallback, useMemo } from 'react';

import { normalize } from 'normalizr';
import { useSelector, useDispatch, batch } from 'react-redux';
import moment from 'moment';

import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';
import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
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

import AutoSizer from 'react-virtualized-auto-sizer';
import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';
import ElevationScroll from 'components/dumb/ElevationScroll';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Typography from '@material-ui/core/Typography';
import BoxEmpty from 'components/dumb/Box/Empty';
import InfiniteLoaderChat from 'components/smart/WindowedList/InfiniteLoaded/Chat';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import Box from '@material-ui/core/Box';
import MessageRow from './Row';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;
const BATCH_SIZE = 10;

function MisakeyNotications() {
  const ref = useRef({});

  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const { items, hasNextPage } = useSelector(getPaginationSelector);
  const newCount = useSelector(getNewCountSelector);
  const dispatch = useDispatch();
  const { t } = useTranslation(['boxes']);

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
    // debounce with 1 seconde to ensure user really has time to see the elements
    // at loading, scroll position changes quickly so "seen" events triggered by those changes
    // should not be considered
    // it also avoid to trigger several request of two elements seen in backend
    // one call for 10 elements is better
    () => debounce(onSeenItems, 1000),
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

  useFetchEffect(
    acknowledgeUserNotifications,
    { shouldFetch: !isEmpty(itemIdsToAck) },
  );

  const itemData = useMemo(() => ({ items, hasNextPage }), [hasNextPage, items]);

  return (
    <>
      <ElevationScroll target={ref.current ? ref.current.outerRef : undefined}>
        <AppBarDrawer>
          <Box display="flex" width="100%" alignItems="center">
            <ToggleDrawerButton />
            <Box display="flex" flexDirection="column" flexGrow={1}>
              <Title gutterBottom={false}>{t('boxes:notifications.byIdentity.title')}</Title>
              <Subtitle gutterBottom={false}>{t('boxes:notifications.byIdentity.subtitle')}</Subtitle>
            </Box>
            <AvatarMisakey alt={t('boxes:notifications.byIdentity.title')} />
          </Box>
        </AppBarDrawer>
      </ElevationScroll>
      <Box height={`calc(100% - ${APPBAR_HEIGHT}px)`}>
        <AutoSizer>
          {(autoSizerProps) => (
            <InfiniteLoaderChat
              {...autoSizerProps}
              Row={MessageRow}
              ref={ref}
              loadNextPage={loadNextPage}
              hasNextPage={hasNextPage}
              isNextPageLoading={isNextPageLoading}
              itemCount={itemsLength}
              itemData={itemData}
              onItemsRendered={onItemsRendered}
              NoMoreItemsElement={itemsLength === 0 ? null : (
                <Typography component={Box} p={1} variant="caption" color="primary">
                  {t('boxes:notifications.byIdentity.noMoreItems')}
                </Typography>
              )}
            />
          )}
        </AutoSizer>
        {itemsLength === 0 && <BoxEmpty title={t('boxes:notifications.byIdentity.empty')} py={0} />}
      </Box>
    </>
  );
}

export default MisakeyNotications;
