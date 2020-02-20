import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import API from '@misakey/api';
import { OPEN, REOPEN } from 'constants/databox/status';

import isNil from '@misakey/helpers/isNil';
import noop from '@misakey/helpers/noop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getStatus } from '@misakey/helpers/databox';

import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VirtualizedList from 'react-virtualized/dist/commonjs/List';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import Skeleton from '@material-ui/lab/Skeleton';
import BoxSection from '@misakey/ui/Box/Section';
import Empty from 'components/dumb/Box/Empty';
import ScreenAction from 'components/dumb/Screen/Action';
import ChipDataboxStatus from 'components/dumb/Chip/Databox/Status';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import InboxIcon from '@material-ui/icons/Inbox';
import RestoreIcon from '@material-ui/icons/Restore';


// CONSTANTS
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

const STATUS_ICON = {
  [OPEN]: <InboxIcon />,
  [REOPEN]: <RestoreIcon />,
};

// HELPERS
const mapItem = ({ owner, ...rest }) => ({
  owner: objectToCamelCase(owner),
  ...objectToCamelCase(rest),
});

// HOOKS
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
    height: `calc(100% - ${theme.spacing(1)}px - 67px)`,
  },
  list: {
    height: '100%',
    minHeight: 3 * ROW_HEIGHT,
  },
  itemContainer: {
    width: '100%',
  },
}));

// COMPONENTS
const Row = ({ list, isRowLoaded, classes, service, index, style }) => {
  const item = list[index] || {};

  const theme = useTheme();
  const showChip = useMediaQuery(theme.breakpoints.up('sm'));

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

  const { id, owner } = item;

  const status = getStatus(item);
  const icon = STATUS_ICON[status];

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
            {icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          secondary={owner.email}
        >
          <Grid container>
            <Grid item sm={7} xs={12}>
              {owner.displayName}
            </Grid>
            {showChip && (
              <Grid spacing={1} container item xs>
                <ChipDataboxStatus databox={item} />
              </Grid>
            )}
          </Grid>
        </ListItemText>
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

  const [list, setList] = useState([]);
  const [offset, setOffset] = useState(0);

  const [isNextPageLoading, setNextPageLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchList = useCallback((queryParams) => {
    setNextPageLoading(true);

    return API.use(ENDPOINTS.databoxes.list)
      .build(null, null, objectToSnakeCase(queryParams))
      .send()
      .then((response) => {
        setList((prevList) => [...prevList, ...response.map(mapItem)]);
        if (response.length !== ITEM_PER_PAGE) { setHasNextPage(false); }
      })
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
      statuses: OPEN,
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

  const shouldFetch = useMemo(
    () => !isNil(service),
    [service],
  );

  const { isFetching: isInternalFetching } = useFetchEffect(
    loadNextPage,
    { shouldFetch },
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: isInternalFetching || isLoading,
      preventSplashScreen: !isNil(service),
    }),
    [error, isLoading, isInternalFetching, service],
  );

  return (
    <ScreenAction
      state={state}
      appBarProps={appBarProps}
      navigationProps={{ showGoBack: false, noWrap: true }}
      title={t('screens:Service.requests.list.title', service)}
    >
      <Container maxWidth="md" className={classes.container}>
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
