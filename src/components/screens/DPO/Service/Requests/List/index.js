import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import API from '@misakey/api';
import isNil from '@misakey/helpers/isNil';
import noop from '@misakey/helpers/noop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VirtualizedList from 'react-virtualized/dist/commonjs/List';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import Skeleton from '@material-ui/lab/Skeleton';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import InboxIcon from '@material-ui/icons/Inbox';

import BoxSection from 'components/dumb/Box/Section';
import Subtitle from 'components/dumb/Typography/Subtitle';
import Empty from 'components/dumb/Box/Empty';
import ScreenAction from 'components/dumb/Screen/Action';

const ENDPOINTS = {
  databoxes: {
    list: {
      method: 'GET',
      path: '/databoxes',
      auth: true,
    },
  },
};

const ROW_HEIGHT = 73;
const ITEM_PER_PAGE = 50;

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
  },
  titles: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  box: {
    // 100% - margins - titlesHeight
    height: `calc(100% - ${2 * theme.spacing(3)}px - 67px)`,
  },
  list: {
    height: '100%',
    minHeight: 3 * ROW_HEIGHT,
  },
  itemContainer: {
    width: '100%',
  },
}));

const Row = ({ list, isRowLoaded, classes, service, index, style }) => {
  const item = list[index] || {};
  const { id, user } = item;

  if (!id || !user) { return false; }

  const isLoaded = isRowLoaded({ index });

  if (!isLoaded) {
    return (
      <ListItem divider style={style}>
        <ListItemAvatar>
          <Skeleton height={40} width={40} variant="circle" />
        </ListItemAvatar>
        <Box mb={1}>
          <Skeleton height={17} width={120} variant="text" />
        </Box>
        <Skeleton height={20} width={120} variant="text" />
      </ListItem>
    );
  }

  return (
    <ListItem
      divider
      style={style}
      component={Link}
      button
      to={generatePath(routes.dpo.service.requests.read, {
        databoxId: id,
        mainDomain: service.mainDomain,
      })}
    >
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        className={classes.itemContainer}
      >
        <ListItemAvatar>
          <Avatar>
            <InboxIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={user.display_name}
          secondary={user.email}
        />
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="see"
          >
            <ArrowForwardIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </Box>
    </ListItem>
  );
};

Row.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object).isRequired,
  isRowLoaded: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  service: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

function ServiceRequestsList({ appBarProps, service, t, isLoading, error }) {
  const classes = useStyles();

  const [internalError, setInternalError] = useState();
  const [list, setList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isInternalFetching, setInternalFetching] = useState(false);

  const state = useMemo(
    () => ({
      error: internalError || error,
      isLoading: isInternalFetching || isLoading,
      preventSplashScreen: !isNil(service),
    }),
    [error, internalError, isLoading, isInternalFetching, service],
  );

  const [isNextPageLoading, setNextPageLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchList = useCallback((queryParams) => {
    setNextPageLoading(true);

    return API.use(ENDPOINTS.databoxes.list)
      .build(null, null, objectToSnakeCase(queryParams))
      .send()
      .then((response) => {
        setList((prevList) => [...prevList, ...response.map((item) => objectToCamelCase(item))]);
        if (response.length !== ITEM_PER_PAGE) { setHasNextPage(false); }
      })
      .catch((e) => { setInternalError(e); })
      .finally(() => {
        setOffset(queryParams.offset + ITEM_PER_PAGE);
        setNextPageLoading(false);
      });
  }, []);

  const loadNextPage = useCallback(() => {
    const payload = {
      producerId: service.id,
      withUsers: true,
      limit: ITEM_PER_PAGE,
      offset,
    };
    return fetchList(payload);
  }, [service, offset, fetchList]);

  const rowCount = useMemo(
    () => (hasNextPage ? list.length + 1 : list.length),
    [hasNextPage, list],
  );

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreRows = useMemo(
    () => (isNextPageLoading ? noop : loadNextPage),
    [isNextPageLoading, loadNextPage],
  );

  // Every row is loaded except for our loading indicator row.
  const isRowLoaded = useCallback(
    ({ index }) => !hasNextPage || index < list.length,
    [hasNextPage, list],
  );

  const listProps = useMemo(() => ({
    list, isRowLoaded, classes, service,
  }), [list, isRowLoaded, classes, service]);

  const handleMount = useCallback(() => {
    if (!isNil(service) && !isInternalFetching) {
      setInternalFetching(true);
      loadNextPage().finally(() => {
        setInternalFetching(false);
      });
    }
  }, [isInternalFetching, setInternalFetching, loadNextPage, service]);

  useEffect(handleMount, [service]);

  return (
    <ScreenAction
      state={state}
      appBarProps={appBarProps}
      title={t('screens:Service.requests.list.title', service)}
      display="flex"
      flexDirection="column"
    >
      <Container maxWidth="md" className={classes.container}>
        <Subtitle>
          {t('screens:Service.requests.list.subtitle')}
        </Subtitle>
        <BoxSection my={3} p={0} className={classes.box}>
          <List className={classes.list} disablePadding>
            {list.length === 0 && <Empty />}
            {list.length > 0 && (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={rowCount}
              >
                {({ onRowsRendered, registerChild }) => (
                  <AutoSizer>
                    {({ width, height }) => (
                      <VirtualizedList
                        width={width}
                        height={height}
                        tabIndex={null}
                        ref={registerChild}
                        onRowsRendered={onRowsRendered}
                        rowHeight={ROW_HEIGHT}
                        rowCount={rowCount}
                        rowRenderer={(rowProps) => <Row {...listProps} {...rowProps} />}
                      />
                    )}
                  </AutoSizer>
                )}
              </InfiniteLoader>
            )}
          </List>
        </BoxSection>
      </Container>
    </ScreenAction>
  );
}

ServiceRequestsList.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mainDomain: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
  isLoading: PropTypes.bool.isRequired,
};

ServiceRequestsList.defaultProps = {
  appBarProps: null,
  service: null,
  error: null,
};

export default withTranslation(['common', 'screens'])(ServiceRequestsList);
