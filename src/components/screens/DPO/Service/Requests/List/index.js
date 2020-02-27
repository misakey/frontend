import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import API from '@misakey/api';
import { OPEN, REOPEN } from 'constants/databox/status';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getStatus } from '@misakey/helpers/databox';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import BoxSection from '@misakey/ui/Box/Section';
import Empty from 'components/dumb/Box/Empty';
import ScreenAction from 'components/dumb/Screen/Action';
import TypographyDateSince from 'components/dumb/Typography/DateSince';

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
const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    flexGrow: 1,
  },
  titles: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemContainer: {
    width: '100%',
  },
}));

// COMPONENTS
const RequestRow = ({ item, classes, service, t }) => {
  const { id, owner, updatedAt } = item;
  const status = useMemo(() => getStatus(item), [item]);
  const icon = useMemo(() => STATUS_ICON[status], [status]);

  const to = useMemo(() => !isNil(id) && generatePath(routes.dpo.service.requests.read, {
    databoxId: id,
    mainDomain: service.mainDomain,
  }), [id, service.mainDomain]);


  return (
    <ListItem
      component={Link}
      button
      to={to}
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
          primary={owner.displayName}
          primaryTypographyProps={{ noWrap: true }}
          secondary={owner.email}
          secondaryTypographyProps={{ noWrap: true }}
        />
        <TypographyDateSince
          date={updatedAt}
          text={t(`common__new:databox.since.${status}`)}
        />
      </Box>
    </ListItem>
  );
};

RequestRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired,
  service: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

const TRequestRow = withTranslation('common__new')(RequestRow);

function ServiceRequestsList({ appBarProps, service, t, isLoading, error }) {
  const classes = useStyles();

  const [list, setList] = useState([]);

  const queryParams = useMemo(
    () => ({
      producerId: service.id,
      withUsers: true,
      statuses: OPEN,
    }), [service],
  );

  const fetchList = useCallback(
    () => API.use(ENDPOINTS.databoxes.list)
      .build(null, null, objectToSnakeCase(queryParams))
      .send()
      .then((response) => {
        setList(response.map(mapItem));
      }),
    [queryParams],
  );

  const shouldFetch = useMemo(
    () => !isNil(service),
    [service],
  );

  const { isFetching: isInternalFetching } = useFetchEffect(
    fetchList,
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
      title={t('dpo__new:requests.list.title')}
    >
      <Container maxWidth="md" className={classes.container}>
        <BoxSection my={3} p={0}>
          <List className={classes.list} disablePadding>
            {list.length === 0 ? <Empty /> : list.map((request) => (
              <TRequestRow key={request.id} item={request} classes={classes} service={service} />
            ))}
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

export default withTranslation(['dpo__new'])(ServiceRequestsList);
